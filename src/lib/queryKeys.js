/**
 * queryKeys.js — Phase 2A + 2B + 2C + 2D (Wishlist) + 2E (Cart)
 *
 * Centralized query key factory for all TanStack Query keys.
 *
 * Design rules:
 *  1. Every key is an array (required by TanStack Query for partial matching).
 *  2. All keys within a feature share the same root segment so
 *     `invalidateQueries({ queryKey: ['products'] })` clears ALL product caches.
 *  3. Keys are pure functions — no side effects, no imports.
 *
 * Usage:
 *   queryKeys.products.detail(42)              → ['products', 'detail', 42]
 *   queryKeys.orders.byUser('u1')              → ['orders', 'user', 'u1']
 *   queryKeys.reviews.byProduct('p5')          → ['reviews', 'product', 'p5']
 *   queryKeys.profile.me('u1')                 → ['profile', 'me', 'u1']
 *   queryKeys.returns.byOrder('o1')            → ['returns', 'order', 'o1']
 *   queryKeys.wishlist.byUser('u1')            → ['wishlist', 'user', 'u1']
 *   queryKeys.cart.all('u1')                   → ['cart', 'u1']
 */
export const queryKeys = {
  // ── Products (Phase 2A) ──────────────────────────────────────────────────
  products: {
    /** Root key — invalidates ALL product queries */
    all: () => ['products'],

    /** All list-type queries (all, category, search) */
    lists: () => ['products', 'list'],

    /** GET /api/products */
    allProducts: () => ['products', 'list', 'all'],

    /** GET /api/products/featured */
    featured: () => ['products', 'featured'],

    /** GET /api/products/:id */
    detail: (id) => ['products', 'detail', Number(id)],

    /** GET /api/products/category/:category */
    byCategory: (category) => ['products', 'list', 'category', category],

    /** GET /api/products/category/:category/subcategory/:sub */
    byCatAndSub: (category, subcategory) => [
      'products', 'list', 'category', category, 'sub', subcategory,
    ],

    /** GET /api/products/search?keyword=... */
    search: (keyword) => ['products', 'search', keyword?.trim().toLowerCase()],
  },

  // ── Orders (Phase 2B) ────────────────────────────────────────────────────
  orders: {
    /** Root key — invalidates ALL order queries */
    all: () => ['orders'],

    /** GET /api/orders/user/:userId */
    byUser: (userId) => ['orders', 'user', String(userId)],

    /** GET /api/orders/:id */
    detail: (id) => ['orders', 'detail', String(id)],
  },

  // ── Reviews (Phase 2B) ───────────────────────────────────────────────────
  reviews: {
    /** Root key — invalidates ALL review queries */
    all: () => ['reviews'],

    /** GET /api/reviews/product/:productId */
    byProduct: (productId) => ['reviews', 'product', String(productId)],
  },

  // ── Profile (Phase 2C) ───────────────────────────────────────────────────
  profile: {
    /** Root key — invalidates ALL profile queries */
    all: () => ['profile'],

    /** GET /api/users/:userId */
    me: (userId) => ['profile', 'me', String(userId)],
  },

  // ── Returns (Phase 2C) ───────────────────────────────────────────────────
  returns: {
    /** Root key — invalidates ALL return queries */
    all: () => ['returns'],

    /** GET /api/orders/:orderId/return */
    byOrder: (orderId) => ['returns', 'order', String(orderId)],
  },

  // ── Wishlist (Phase 2D) ──────────────────────────────────────────────────
  wishlist: {
    /** Root key — invalidates ALL wishlist queries */
    all: () => ['wishlist'],

    /** GET /api/wishlist/user/:userId  (or /api/wishlist — depends on backend) */
    byUser: (userId) => ['wishlist', 'user', String(userId)],
  },

  // ── Cart (Phase 2E) ──────────────────────────────────────────────────────
  cart: {
    /**
     * Root key — mirrors the local cartKeys.all(userId) factory in useCart.js
     * so cartSync.js and useCartSync.js can both invalidate the same entry.
     *
     * queryKeys.cart.all(userId) → ['cart', userId]
     */
    all: (userId) => ['cart', userId],
  },
};
