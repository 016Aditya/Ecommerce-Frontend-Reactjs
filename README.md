🛒 ShopApp Frontend

React 19 + Vite single-page application for the ShopApp e-commerce platform.

A modern, feature-driven storefront covering the complete retail journey: browse → search → cart → checkout → orders → returns, with reviews, wishlist, profile, and saved addresses.


✨ Highlights

🛍️ Full e-commerce shopping flow

👤 Guest shopping with automatic post-login cart/wishlist migration

⚡ Server-state caching with TanStack Query

🎛️ Client/UI state isolated in Zustand

🔐 JWT authentication with centralized session-expiry handling

🌙 Theme persistence with no first-paint flash

📱 Responsive UI with Tailwind CSS

🚀 Lazy-loaded routes, vendor chunking and production service worker

🔎 SEO metadata, canonical URLs, sitemap and structured data

📚 Table of Contents

Overview

Tech Stack

Architecture

Project Structure

State Management

Guest-to-Account Sync

Routing

API Layer

Design Decisions

Performance & Build

Configuration

Getting Started

Roadmap

🏗️ Architecture

graph TB
    subgraph Browser
        UI[Feature pages & components]
        ZU[Zustand<br/>auth session, UI flags]
        TQ[TanStack Query<br/>server-state cache]
        LS[(localStorage<br/>guest cart/wishlist, JWT)]
        SW[Service worker<br/>prod-only asset cache]
    end

    AX[Axios instance<br/>JWT interceptor]
    API[Spring Boot REST API]

    UI --> ZU
    UI --> TQ
    ZU <-.persist.-> LS
    UI -.guest mode.-> LS
    TQ --> AX
    AX -->|Bearer JWT| API
    AX -.401 → clear + redirect.-> ZU
    SW -.caches static assets.-> UI


Data flow for a typical page: a feature hook (e.g. useProducts) calls useQuery/useMutation from TanStack Query, which calls a service function (e.g. productService.js), which calls the shared Axios instance, which attaches the JWT and hits the backend. The component itself never touches Axios or fetch directly.

Page / Component
      │
      ▼
Feature Hook
      │
      ▼
TanStack Query
      │
      ▼
Feature Service
      │
      ▼
Shared Axios
      │
      ├── JWT interceptor
      └── 401 handling
      │
      ▼
Spring Boot REST API

📁 Project Structure

src/
├── app/                 # App.jsx (root), providers.jsx
├── api/                 # Axios instance + endpoint path constants
├── components/          # Shared UI: common/, layout/, skeleton/
├── config/              # env.js, constants.js, featureFlags.js, seoConfig.js
├── errors/              # ErrorBoundary, AppError, error message maps
├── features/            # Domain modules — see below
│   ├── auth/
│   ├── cart/
│   ├── orders/
│   ├── products/
│   ├── reviews/
│   ├── wishlist/
│   ├── address/
│   ├── profile/
│   └── customerService/
├── hooks/               # Low-level TanStack Query hooks (see State management)
├── lib/                 # queryClient.js, queryKeys.js
├── routes/              # AppRoutes.jsx, PrivateRoute, PublicRoute, paths.js
├── services/            # Cross-feature API service functions
├── store/                # Zustand stores: auth, cart (UI-only), theme, toast
├── styles/              # Global CSS
└── utils/               # Formatters, storage helpers, debounce, etc.


Each feature folder follows the same internal shape: api/ or services/ (backend calls), components/, hooks/ (feature-facing hooks), pages/, and occasionally utils//validation/. cart, wishlist, and address are fully self-contained within their feature folder; products, orders, reviews, and profile additionally rely on shared low-level hooks in the top-level hooks/ folder (see next section) — this is a deliberate layering, not an inconsistency.

🧠 State Management

The single most load-bearing architectural rule in this codebase: Zustand never touches the network.



Zustand

TanStack Query

Owns

Auth session, UI flags, optimistic snapshots, theme, toasts

Products, cart, orders, reviews, wishlist, profile

Storage

localStorage for auth via persist

In-memory cache

Network

Never

Yes, through service functions

This split exists because of a real bug: the old cartStore mixed async API calls with UI state. A 401 response triggered the Axios interceptor's redirect-to-login and cartStore's own error handling on the same (now-unmounting) tree, causing a re-render loop that fired more requests. Splitting "server truth" (TanStack Query) from "UI truth" (Zustand) — with 401 handling living exclusively in the Axios interceptor — removed the race entirely.

Two-tier hooks pattern. For orders, products, reviews, and profile, the actual useQuery/useMutation calls live in a top-level hooks/useQueryX.js file (cache config, retry policy, query keys), and each feature exposes a thin public-facing wrapper in features/X/hooks/useX.js that preserves a stable hook API (useOrders(), usePlaceOrder(), etc.) for pages. Pages only ever import the feature-level wrapper; the low-level hook is an implementation detail. cart, wishlist, and address skip the extra layer since their query logic is simple enough to live directly in the feature folder.

Centralized query keys (lib/queryKeys.js) — every TanStack Query key is produced by a factory function under a shared root segment per domain (['orders', 'user', userId], ['cart', userId], etc.), so invalidateQueries({ queryKey: queryKeys.orders.all() }) reliably clears every related cache entry without string-matching by hand.

Retry policy (lib/queryClient.js) is deliberately narrow: only network failures and 5xx responses retry (with exponential backoff + jitter, capped at 2 attempts); 401/403/404 never retry, since retrying an auth failure just delays the inevitable redirect. Mutations never auto-retry — a duplicate "place order" click should never happen because of a silent client-side retry.

🔄 Guest-to-Account Data Migration

Guests get a fully functional cart and wishlist backed by localStorage. When they log in or register, postLoginSync() merges both into the backend in parallel:

Login / Register
      │
      ▼
authStore
      │
      ▼
postLoginSync(userId)
   ┌──┴──────────────┐
   ▼                 ▼
syncCart         syncWishlist
   │                 │
   ▼                 ▼
POST /cart/...    POST /wishlist/...
   │                 │
   └──────┬──────────┘
          ▼
Clear localStorage only after successful sync

The safety rule that makes this reliable: localStorage is only cleared after the backend confirms the merge succeeded — never in a finally block. If the sync request fails (network error, backend down), the guest's cart/wishlist stays intact in localStorage and is retried on the next login. Both authStore and postLoginSync treat sync failures as non-fatal to authentication — a failed cart merge never blocks login.

authStore itself only imports postLoginSync — it has no direct knowledge of guestCartService, cartSync, guestWishlistService, or wishlistSync. Adding a new guest-data migration (saved-for-later items, a promo code, etc.) means extending postLoginSync.js, not touching the store.

🧭 Routing

All routes are declared once in routes/paths.js (PATHS) — never hardcoded as string literals.

Every route except the OAuth2 callback is wrapped in a shared PageWrapper (Navbar + Footer via <Outlet/>).

Route-level code splitting via React.lazy + Suspense for every page except HomePage (loaded eagerly since it's the most common landing page).

PrivateRoute guards authenticated-only pages (checkout, orders, profile, saved addresses). While Zustand's persist middleware is still rehydrating from localStorage, it renders a themed skeleton bar instead of a blank flash, then redirects to /login (preserving the intended destination) only once hydration confirms there's no user.

Cart and Wishlist are intentionally outside PrivateRoute — both pages branch internally on auth state (guest → localStorage, authenticated → backend), so a guest can shop and build a cart without ever hitting a login wall. Only "Proceed to checkout" gates on auth.

The product detail route is keyed on :id (<Suspense key={id}>) so navigating between two different products fully remounts the subtree instead of reusing stale state from the previous product.

🔌 API Layer

A single Axios instance (api/api.js) is shared by every service function:

Request interceptor attaches Authorization: Bearer <token> from localStorage to every outgoing request.

Response interceptor watches for 401. If one comes back from anywhere except the login/register/password-recovery endpoints themselves, it clears all auth state (localStorage + the Zustand persist key) and hard-redirects to /login?session=expired. This is the only place session-expiry handling lives — no feature has to catch 401s itself.

Each feature has its own services/ (or api/) folder of thin functions that call this shared instance and return plain data — no feature imports Axios directly.

💡 Key Design Decisions

1. Optimistic cart updates with a clean settle path. cartStore's optimisticItems array is written synchronously when a user clicks "Add to cart," so the UI reflects the change before the network round-trip completes. It's cleared in the mutation's onSettled, regardless of success or failure, so it can never drift permanently out of sync with the server-confirmed cart.

2. Theme is applied before first paint. initThemeEarly() runs synchronously in main.jsx, before ReactDOM.createRoot(...).render(...), reading the persisted theme and applying it to the document — eliminating the flash-of-wrong-theme that a useEffect-based approach would cause.

3. Dev tooling never ships to production. ReactQueryDevtools is loaded through a React.lazy component gated on import.meta.env.DEV, so the devtools chunk is excluded from the production bundle even if tree-shaking alone wouldn't catch it.

4. Service worker only registers in production, and actively unregisters itself in development (so a stale cached dev build can never mask new local changes). In production it re-checks for updates every 60 minutes and registration is deferred via requestIdleCallback so it never competes with first paint.

5. Feature flags gate incomplete features. config/featureFlags.js currently ships ENABLE_OAUTH: false and ENABLE_COUPONS: false — the OAuth2 callback route and UI already exist in the codebase but are flagged off until the backend flow is finished, rather than being half-wired into the live app.

⚡ Performance & Build

Manual chunk splitting (vite.config.js): React/ReactDOM, React Router, Zustand, and the Axios/toast bundle are each split into their own vendor chunk so a deploy that only changes app code doesn't bust the cache for rarely-changing vendor code.

Per-chunk CSS splitting and esbuild minification; sourcemaps disabled in production builds.

PWA basics are in place: public/manifest.json, public/sw.js, robots.txt, and sitemap.xml all exist, plus an SEO component that manages per-page meta tags, canonical URLs, and structured data.

SW cache-busting: the Vite config injects a Date.now()-based version string into the service worker at build time, so every production deploy gets a new cache name and the browser is forced to drop the old one.

⚙️ Configuration

All environment variables are funneled through config/env.js — nothing in the app should call import.meta.env directly anywhere else.

Variable Default (if unset) Purpose





VITE_API_BASE_URL

http://localhost:8080/api

Base URL for every backend request

VITE_TURNSTILE_SITE_KEY

''

Cloudflare Turnstile site key (paired with the backend's secret key)

Create a .env file in the project root for local overrides (never commit it — commit a .env.example instead):

VITE_API_BASE_URL=http://localhost:8080/api
VITE_TURNSTILE_SITE_KEY=your-site-key-here


🚀 Getting Started

Prerequisites: Node.js, the backend running locally (see learnSpringMongoDb) or a reachable API URL.

# 1. Install dependencies
npm install

# 2. Configure environment (optional — sensible localhost defaults exist)
cp .env.example .env

# 3. Start the dev server
npm run dev

# Production build
npm run build
npm run preview   # serve the production build locally


Script

Purpose

npm run dev

Vite dev server + HMR

npm run build

Production build → dist/

npm run preview

Serve production build locally

npm run lint

ESLint

🛣️ Known Limitations & Roadmap

No automated test suite. No test runner or test files currently exist. The best first candidates are cartSync, postLoginSync, and useCart guest/auth branching; Vitest would fit naturally with Vite.

Route constants are duplicated across routes/paths.js, config/constants.js, and utils/constants.js. Only routes/paths.js is current; the others are stale and should eventually be consolidated.

A few orphaned product files remain from an incomplete migration. The active product data layer is hooks/useQueryProducts.js + top-level services/productService.js; the unused feature-level files can be removed.

ENABLE_OAUTH and ENABLE_COUPONS feature flags are off — the OAuth2 success page and route exist but the login flow to reach it isn't wired up yet; coupon UI doesn't exist yet at all.

Product images use third-party CDN URLs from backend seed data. This is acceptable for a demo/portfolio dataset; production should move assets to owned storage such as S3 or Cloudinary.
