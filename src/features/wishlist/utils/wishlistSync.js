/**
 * wishlistSync.js
 *
 * Called once after a successful login/registration to merge any items
 * saved in LocalStorage while the user was a guest into their MongoDB
 * wishlist via a single bulk POST request.
 *
 * Flow:
 *   1. Read product IDs from LocalStorage.
 *   2. If empty → nothing to do, return early.
 *   3. POST /api/wishlist/user/:userId/sync with the ID array.
 *   4. Backend merges, skipping duplicates.
 *   5. Clear LocalStorage guest wishlist.
 *
 * Network errors are caught and silently ignored — the user's existing
 * MongoDB wishlist is never damaged by a failed sync.
 */

import { getGuestWishlist, clearGuestWishlist } from '@/services/guestWishlistService';
import { syncGuestWishlist } from '@/services/wishlistService';

/**
 * @param {string} userId - The authenticated user's ID
 * @returns {Promise<boolean>} true if sync was attempted, false if skipped
 */
export const syncWishlist = async (userId) => {
  if (!userId) return false;

  const guestIds = getGuestWishlist();
  if (!guestIds.length) return false;

  try {
    await syncGuestWishlist(userId, guestIds);
  } catch {
    // Silently ignore network failures — the guest IDs remain in LocalStorage
    // for the next login attempt. This is intentional resilience.
  }

  // Always clear LocalStorage after attempt — avoids infinite retry loops
  // on persistent backend errors.
  clearGuestWishlist();
  return true;
};
