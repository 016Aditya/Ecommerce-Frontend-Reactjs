/**
 * wishlistSync.js
 *
 * Called once after a successful login/registration to merge any items
 * saved in LocalStorage while the user was a guest into their MongoDB
 * wishlist via a single bulk POST request.
 *
 * Correct flow:
 *   1. Read product IDs from LocalStorage.
 *   2. If empty → nothing to do, return false.
 *   3. POST /api/wishlist/user/:userId/sync with the ID array.
 *   4. Backend merges, skipping duplicates.
 *   5. On SUCCESS  → clear LocalStorage, invalidate wishlist queries, prefetch.
 *   6. On FAILURE  → throw error so LocalStorage is preserved for next login.
 *
 * CRITICAL: LocalStorage is NEVER cleared on failure.
 * The caller (authStore) catches the thrown error and treats sync failure
 * as non-fatal — the user's session is still set, but guest items remain
 * in LocalStorage for the next login attempt.
 */

import { getGuestWishlist, clearGuestWishlist } from '@/services/guestWishlistService';
import { syncGuestWishlist, getWishlist }        from '@/services/wishlistService';
import { queryClient }                           from '@/lib/queryClient';
import { queryKeys }                             from '@/lib/queryKeys';

/**
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<boolean>} true if sync was attempted and succeeded, false if skipped
 * @throws  Will re-throw backend errors so the caller can decide to keep LocalStorage
 */
export const syncWishlist = async (userId) => {
  if (!userId) return false;

  const guestIds = getGuestWishlist();
  if (!guestIds.length) return false;

  // POST to backend — let any error propagate so LocalStorage is NOT cleared
  await syncGuestWishlist(userId, guestIds);

  // ── Success path only ────────────────────────────────────────────────────
  // Only reaches here if the POST succeeded (no throw above).

  // 1. Clear guest storage now that the backend confirmed the merge.
  clearGuestWishlist();

  // 2. Invalidate ALL wishlist queries (prefix match covers byUser too).
  //    This forces any mounted useWishlistQuery to refetch.
  await queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all() });

  // 3. Eagerly prefetch the user's wishlist so it's in cache before
  //    the component tries to render it.
  queryClient.prefetchQuery({
    queryKey: queryKeys.wishlist.byUser(userId),
    queryFn:  () => getWishlist(userId),
  });

  return true;
};
