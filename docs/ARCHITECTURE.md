# Architecture

This document explains *why* the codebase is organized the way it is — the boundaries between
layers, the state-management split, and the handful of patterns that show up repeatedly across
features. It assumes you've read the [README](../README.md) quick-start already.

## 1. High-level shape

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser                                                         │
│                                                                   │
│   React components                                               │
│      │                                                            │
│      ├── Server state  → TanStack Query  → src/api/api.js (axios)│
│      │                                        │                   │
│      └── Client state  → Zustand stores       │                   │
│              (auth, cart badge, theme, toasts)│                   │
│                                                ▼                   │
│                                     Spring Boot + MongoDB API     │
│                                     (separate repo, Railway)      │
└─────────────────────────────────────────────────────────────────┘
```

The frontend is a static SPA (Vite build, no SSR) that talks to one REST API. There's no BFF layer
today — `src/api/api.js` is the single axios instance every service module imports, with request/
response interceptors handling auth-token attachment and 401 session-expiry globally.

## 2. State management: two kinds of state, two tools

This is the most important architectural decision in the app, and it's applied consistently:

- **Server state** (anything that lives in the database — products, cart contents, orders,
  reviews, profile) is owned by **TanStack Query**. Components never `useState` + `useEffect` to
  fetch data; they call a query hook (`src/hooks/useQuery*.js` or a feature's own
  `hooks/useX.js`) and get caching, dedup, background refetch, and mutation-driven cache
  invalidation for free.
- **Client-only state** (auth session, cart item count badge, active theme, toast queue) lives in
  **Zustand** (`src/store/`), persisted to `localStorage` where it needs to survive a refresh
  (auth, theme).

Mixing these up is the usual way apps like this rot — e.g. storing server data in Zustand leads to
stale-cache bugs because nothing tells the store to refetch. Keeping the split strict means: if
it came from the API, it's a TanStack Query cache entry; if it's UI/session state, it's a Zustand
store.

`src/lib/queryClient.js` configures the shared `QueryClient`; `src/lib/queryKeys.js` centralizes
query key construction so cache invalidation after a mutation (e.g. "editing a product should
invalidate that product's detail query") references the same key structure everywhere instead of
ad-hoc arrays scattered across hooks.

## 3. Guest-to-account data migration

Cart and wishlist both work fully logged-out, backed by `localStorage`
(`src/features/cart/services/guestCartService.js`,
`src/features/wishlist/services/guestWishlistService.js`). On login, that guest data needs to
merge into the user's server-side cart/wishlist without clobbering either side.

That merge is coordinated by a single module, `src/features/auth/utils/postLoginSync.js`, which:
- runs the wishlist sync and cart sync **in parallel** via `Promise.allSettled` (they're
  independent, no reason to serialize them),
- treats a sync failure as **non-fatal to login** — a failed merge doesn't block the user from
  getting into their account, and the guest data is left intact for a retry next login,
- is the *only* thing `authStore` imports for this — the store never touches
  `guestCartService`/`cartSync`/`guestWishlistService`/`wishlistSync` directly. That indirection
  means adding a new kind of guest data to migrate (saved-for-later items, a promo code, etc.)
  only means extending the array inside `postLoginSync`, not touching the auth store.

## 4. Auth & route protection

- `src/store/authStore.js` (Zustand + `persist`) holds `{ user, token }`. The JWT is written to
  both the persisted store *and* a raw `localStorage['auth_token']` key — the raw key exists so
  the axios interceptor can read a valid token immediately, before Zustand's async persist
  rehydration finishes on a hard refresh.
- `src/api/api.js`'s request interceptor attaches `Authorization: Bearer <token>` to every
  outgoing request; the response interceptor watches for `401`s and force-logs-out + redirects to
  `/login?session=expired` (skipped for the auth endpoints themselves, so a failed login doesn't
  trigger a logout-redirect loop).
- Route protection is composition-based, not per-page checks: `src/routes/PrivateRoute.jsx` wraps
  a `<Route element={...}>` block in `AppRoutes.jsx` and redirects to login (preserving the
  attempted location in router state) if there's no user; `PublicRoute.jsx` is the inverse, kept
  logged-in users off `/login` and `/register`.
- `authStore.isAdmin()` already exists (`user?.role === 'ADMIN'`) but has no consuming UI yet —
  it's there for the planned admin dashboard (see [§8](#planned-evolution-reviews-microservice--admin-dashboard)).

## 5. API layer conventions

- `src/api/apiEndpoints.js` centralizes endpoint paths as a flat `API_ENDPOINTS` object
  (`PRODUCTS`, `ORDERS`, `REVIEWS`, ...), all relative to the one `baseURL` configured in
  `src/api/api.js` via `VITE_API_BASE_URL`. Nothing hardcodes a URL string outside this file.
- Newer, more deeply-nested resources (addresses) use a builder-function convention instead —
  `list()`, `detail(id)`, `update(id)` — which reads better once an endpoint needs more than one
  dynamic segment. This is the recommended style going forward for any new resource with
  sub-paths.
- Each feature's `services/` (or top-level `src/services/`) module is a thin wrapper: one
  exported function per endpoint, no business logic, so the surface between "network shape" and
  "app shape" stays visible in one place per resource.

## 6. Theming

Theme state lives in `src/store/themeStore.js`, but the interesting part is
`initThemeEarly()`, called synchronously in `main.jsx` **before** the first React render. It reads
the persisted theme choice and applies it directly to the DOM immediately, so there's no
flash-of-wrong-theme between the HTML shell painting and React hydrating. Component styling reads
CSS custom properties (`var(--text-primary)`, `var(--navbar-bg)`, etc., defined in
`src/styles/theme.css`/`variables.css`) rather than duplicating light/dark values inline, so a
theme change is a single attribute flip, not a re-render cascade.

## 7. Performance & PWA

- **Route-level code splitting**: every page in `src/routes/AppRoutes.jsx` is `React.lazy()`-
  loaded and wrapped in its own `<Suspense fallback={<PageLoader/>}>` — the initial bundle only
  contains the app shell, not every page.
- **Manual vendor chunking** (`vite.config.js`): React/ReactDOM, the router, Zustand, and
  axios/react-hot-toast are each split into their own long-lived cache chunk, separate from
  app code that changes every deploy — so a deploy doesn't invalidate the browser's cached copy
  of React itself.
- **Service worker** (`public/sw.js`, registered via `src/utils/registerSW.js` using
  `requestIdleCallback` so it never competes with the initial render): the cache name is derived
  from a build-time timestamp injected by Vite (`SW_VERSION` in `vite.config.js`), so every
  production deploy gets a fresh cache name and old cached assets are dropped automatically —
  no manual cache-busting step.
- **React Query Devtools** are loaded via a separate `React.lazy()`'d component gated on
  `import.meta.env.DEV`, so the devtools chunk is provably excluded from production bundles
  rather than just tree-shaken-and-hopefully-gone.
- SEO basics (`public/robots.txt`, `public/sitemap.xml`, `src/hooks/useSEO.js`,
  `src/components/common/SEO.jsx`) and a `manifest.json` make the app installable and crawlable,
  not just functional.

## 8. Feature flags

`src/config/featureFlags.js` is a single `FLAGS` object gating entire feature surfaces (reviews,
returns, wishlist, OAuth login, coupons, real-time tracking) — a flag can hide a feature from the
UI without touching the component that implements it, and can be gated on environment
(`env.IS_PROD`) for a staged rollout. Currently: reviews, returns, and wishlist are on; OAuth,
coupons, and real-time tracking are scaffolded-but-off.

## Planned Evolution: Reviews microservice + admin dashboard

The next architectural step for this project (in progress) is extracting **Reviews** out of the
monolith into a standalone Spring Boot service with its own MongoDB database — a deliberate
microservices exercise, not a scaling necessity at this size. The full design (endpoint
contracts, JWT-sharing strategy, the cross-service rating-sync callback, and the accompanying
`/admin` dashboard this frontend will gain to manage products/orders/moderate reviews) is written
up in detail as a standalone plan and will be reflected here once implemented. At a glance:

- Reviews service validates the same JWT the monolith issues (shared secret) — no separate auth
  server.
- It owns its data independently; the monolith's `Product.averageRating`/`reviewCount` fields
  stay in sync via a callback the Reviews service fires after every write.
- `/admin` lands inside this app as a role-gated route section (`isAdmin()` already exists in
  `authStore`, just needs a consuming route guard), not a separate frontend.
