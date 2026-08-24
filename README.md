# ShopApp — E-Commerce Frontend

A full-featured e-commerce storefront built with React 19 and Vite, backed by a Spring Boot +
MongoDB REST API. Built as a portfolio project to practice production-grade frontend
architecture: server-state caching, guest-to-account data migration, offline-ready PWA behavior,
and a feature-based codebase that scales past "tutorial size."

**Live app:** deployed on Cloudflare Pages · **Backend:** Spring Boot + MongoDB on Railway

For a deeper technical walkthrough of how the pieces fit together, see
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Features

- **Catalog & search** — category/subcategory filtering, keyword search with pagination, similar-products recommendations
- **Cart & wishlist that work logged-out** — guests get a fully working cart/wishlist in `localStorage`; both merge into the server-backed versions automatically on login (no lost items)
- **Checkout & orders** — address book, order placement, order history, order detail with status timeline, return/refund requests
- **Reviews** — star ratings with a written review per product, edit/delete your own review
- **Auth** — JWT-based login/register, forgot/reset password, protected routes, session-expiry handling
- **Light/dark theme** — persisted, flash-free on reload
- **Installable PWA** — service worker with cache-busting per deploy, offline-friendly shell
- **Mobile-first UI** — dedicated mobile navigation drawer (swipe-to-close), bottom nav, mobile search overlay

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19, React Router 7 |
| Server state | TanStack Query 5 |
| Client state | Zustand 5 (persisted) |
| Styling | Tailwind CSS 4 + CSS custom properties (theming) |
| Forms/validation | Yup |
| HTTP | Axios |
| Bot protection | Cloudflare Turnstile |
| Build | Vite 8 |
| Backend | Spring Boot + MongoDB (separate repo) |

## Getting Started

### Prerequisites
- Node.js 18+
- A running instance of the backend API (or point `VITE_API_BASE_URL` at a deployed one)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create `.env.local` in the project root:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_TURNSTILE_SITE_KEY=your-cloudflare-turnstile-site-key
```
Only variables prefixed with `VITE_` are exposed to client code (Vite convention). `.env.local`
overrides `.env` in development and is gitignored — never commit real secrets.

### 3. Run the dev server
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
npm run preview   # sanity-check the production build locally
```

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint over the project |

## Project Structure

```txt
src/
├── app/            # App shell — root component + provider composition
├── api/            # Axios instance + centralized endpoint map
├── components/     # Shared UI: layout (Navbar/Footer/BottomNav), common, skeletons
├── config/         # Env, feature flags, SEO config, app constants
├── errors/         # Error boundary, app-level error types, fallback UI
├── features/       # One folder per domain: auth, products, cart, orders,
│                   # wishlist, reviews, profile, address, customerService, home
│                   # (each: components/ hooks/ pages/ services/ styles/)
├── hooks/          # Cross-feature hooks (TanStack Query wrappers, SEO, debounce)
├── lib/            # queryClient + queryKeys (TanStack Query setup)
├── routes/         # Route table, path constants, PrivateRoute/PublicRoute guards
├── store/          # Zustand stores: auth, cart badge, theme, toasts
├── styles/         # Global CSS, theme variables, mobile overrides
└── utils/          # Formatters, validation, storage helpers, SW registration
```

Each feature folder is self-contained (its own components/hooks/services), so a feature can be
read, tested, or removed without hunting across the codebase. Code shared by more than one
feature lives in the top-level `components/`, `hooks/`, or `utils/` folders — see
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the reasoning behind this split.

## Deployment

- **Frontend**: Cloudflare Pages, connected via GitHub — every push to `main` triggers a build
  (`npm run build`, output `dist/`). No server-side rendering; this is a static SPA build.
- **Backend**: Spring Boot + MongoDB, deployed separately (Railway). The frontend only knows
  about it through `VITE_API_BASE_URL` — swapping environments doesn't require a code change.

## Roadmap

- Standalone Reviews microservice (own Spring Boot service + own MongoDB, extracted from the
  monolith) — see the architecture doc's [Planned Evolution](docs/ARCHITECTURE.md#planned-evolution-reviews-microservice--admin-dashboard) section
- Admin dashboard (`/admin`) for product, order, and review management
- OAuth2 social login (Google/GitHub)
- Automated test coverage (unit + integration)

## Author

Built by Aditya Nihal Singh as a portfolio project.
