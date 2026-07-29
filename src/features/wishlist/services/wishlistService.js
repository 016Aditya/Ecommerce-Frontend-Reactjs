import api from '@/api/api';

/**
 * wishlistService — pure async functions, no React, no hooks.
 *
 * Backend controller routes (WishlistController.java):
 *   GET    /api/wishlist/user/{userId}                    → get wishlist
 *   POST   /api/wishlist/user/{userId}/add/{productId}    → add product
 *   DELETE /api/wishlist/user/{userId}/remove/{productId} → remove product
 *   DELETE /api/wishlist/user/{userId}/clear              → clear wishlist
 *   POST   /api/wishlist/user/{userId}/sync               → bulk sync (guest merge)
 */

export const getWishlist = async (userId) => {
  const { data } = await api.get(`/wishlist/user/${userId}`);
  return data;
};

/**
 * addToWishlist
 * POST /api/wishlist/user/{userId}/add/{productId}
 */
export const addToWishlist = async (userId, productId) => {
  const { data } = await api.post(`/wishlist/user/${userId}/add/${productId}`);
  return data;
};

/**
 * removeFromWishlist
 * DELETE /api/wishlist/user/{userId}/remove/{productId}
 */
export const removeFromWishlist = async (userId, productId) => {
  const { data } = await api.delete(`/wishlist/user/${userId}/remove/${productId}`);
  return data;
};

/**
 * clearWishlist
 * DELETE /api/wishlist/user/{userId}/clear
 */
export const clearWishlist = async (userId) => {
  await api.delete(`/wishlist/user/${userId}/clear`);
};

/**
 * syncGuestWishlist — Bulk sync endpoint.
 * POST /api/wishlist/user/{userId}/sync
 * Body: { productIds: string[] }
 *
 * Backend merges all IDs into the user's wishlist, skipping duplicates.
 * Called once after login/register if guest had saved items.
 */
export const syncGuestWishlist = async (userId, productIds) => {
  const { data } = await api.post(`/wishlist/user/${userId}/sync`, { productIds });
  return data;
};
