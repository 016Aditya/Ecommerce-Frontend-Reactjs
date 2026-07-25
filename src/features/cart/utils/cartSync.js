/**
 * cartSync.js
 *
 * Migrates the guest (LocalStorage) cart into the authenticated user's
 * backend cart after a successful login or registration.
 *
 * Mirrors wishlistSync.js exactly — same flow, same safety contract:
 *
 *   1. Validate userId.
 *   2. Read guest items from LocalStorage via guestCartService.
 *   3. If empty → skip, return { synced: false, reason: 'empty' }.
 *   4. POST the full item array to the backend sync endpoint.
 *   5. On SUCCESS only:
 *        a. clearGuestCart()  — LocalStorage wiped ONLY here.
 *        b. Invalidate the authenticated cart query.
 *        c. Prefetch the updated cart.
 *        d. return { synced: true }
 *   6. On FAILURE → re-throw so the caller (postLoginSync) treats it as
 *      non-fatal and preserves LocalStorage for the next login attempt.
 *
 * CRITICAL: clearGuestCart() is NEVER called in a finally block.
 * It is called ONLY inside the success path, after the backend confirms.
 *
 * This module has no React UI and no toast logic.
 */

import { getGuestCart, clearGuestCart }    from '@/services/guestCartService';
import { syncGuestCart, getCart }          from '@/services/cartService';
import { queryClient }                    from '@/lib/queryClient';
import { queryKeys }                      from '@/lib/queryKeys';

/**
 * Merge the guest cart into the authenticated backend cart.
 *
 * @param {string} userId  The authenticated user's ID.
 * @returns {Promise<{ synced: boolean, reason?: string }>}
 * @throws Will re-throw backend errors — caller decides how to handle.
 */
export const syncCart = async (userId) => {
  if (!userId) return { synced: false, reason: 'no-user' };

  const guestItems = getGuestCart();
  if (guestItems.length === 0) return { synced: false, reason: 'empty' };

  // POST to backend — any error propagates so LocalStorage is NOT cleared.
  await syncGuestCart(userId, guestItems);

  // ── Success path only ────────────────────────────────────────────────────
  // Only reaches here if syncGuestCart() resolved without throwing.

  // 1. Wipe guest storage now that the backend confirmed the merge.
  clearGuestCart();

  // 2. Invalidate ALL cart queries for this user so any mounted hook refetches.
  await queryClient.invalidateQueries({ queryKey: queryKeys.cart.all(userId) });

  // 3. Eagerly prefetch the user's cart so it is in cache before the component
  //    renders — same pattern as wishlistSync.
  queryClient.prefetchQuery({
    queryKey: queryKeys.cart.all(userId),
    queryFn:  () => getCart(userId),
  });

  return { synced: true };
};
