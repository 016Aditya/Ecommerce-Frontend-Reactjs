/**
 * postLoginSync.js
 *
 * Single post-login coordinator.  Called once after the JWT and user state
 * are stored in authStore, BEFORE the caller navigates.
 *
 * Responsibilities:
 *   - Run wishlist sync and cart sync in PARALLEL (they are independent).
 *   - Treat individual sync failures as non-fatal to authentication.
 *   - Preserve failed guest data intact for a retry on the next login.
 *   - Return structured results so authStore (or tests) can inspect outcomes.
 *
 * authStore imports ONLY this module — it never imports guestCartService,
 * cartSync, guestWishlistService, or wishlistSync directly.  That keeps
 * the store decoupled from feature-level implementation details and makes
 * it trivial to add more guest-data migrations (saved items, coupons, etc.)
 * by extending the Promise.allSettled array here.
 *
 * This module has no React UI and no toast logic.
 */

import { syncWishlist } from '@/features/wishlist/utils/wishlistSync';
import { syncCart }     from '@/features/cart/utils/cartSync';

/**
 * Normalise a Promise.allSettled() result into { synced, error }.
 * @param {{ status: string, value?: unknown, reason?: unknown }} settled
 * @returns {{ synced: boolean, error: Error | null }}
 */
const normalizeSyncResult = (settled) => {
  if (settled.status === 'fulfilled') {
    const value = settled.value;
    // syncWishlist returns boolean; syncCart returns { synced, reason? }
    const synced = typeof value === 'boolean' ? value : (value?.synced ?? false);
    return { synced, error: null };
  }
  return { synced: false, error: settled.reason instanceof Error ? settled.reason : new Error(String(settled.reason)) };
};

/**
 * Run all guest-data migration utilities in parallel after a successful login
 * or auto-authenticating registration.
 *
 * @param {string} userId  The authenticated user's ID.
 * @returns {Promise<{
 *   wishlist: { synced: boolean, error: Error | null },
 *   cart:     { synced: boolean, error: Error | null }
 * }>}
 */
const postLoginSync = async (userId) => {
  const [wishlistResult, cartResult] = await Promise.allSettled([
    syncWishlist(userId),
    syncCart(userId),
  ]);

  return {
    wishlist: normalizeSyncResult(wishlistResult),
    cart:     normalizeSyncResult(cartResult),
  };
};

export default postLoginSync;
