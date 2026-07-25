// 1. Point to the API instance that has the Interceptor!
import api from "@/api/api";
import { API_ENDPOINTS } from "@/api/apiEndpoints";

// GET /api/cart/:userId
export const getCart = async (userId) => {
  const { data } = await api.get(`${API_ENDPOINTS.CART}/${userId}`);
  return data;
};

// POST /api/cart/:userId/add  — body: { productId, quantity }
export const addItemToCart = async (userId, productId, quantity) => {
  const { data } = await api.post(`${API_ENDPOINTS.CART}/${userId}/add`, {
    productId,
    quantity,
  });
  return data;
};

// PUT /api/cart/:userId/items  — body: { productId, quantity }
export const updateCartItem = async (userId, productId, quantity) => {
  const { data } = await api.put(`${API_ENDPOINTS.CART}/${userId}/items`, {
    productId,
    quantity,
  });
  return data;
};

// DELETE /api/cart/:userId/items/:productId
export const removeItemFromCart = async (userId, productId) => {
  const { data } = await api.delete(
    `${API_ENDPOINTS.CART}/${userId}/items/${productId}`
  );
  return data;
};

// DELETE /api/cart/:userId/clear
export const clearCart = async (userId) => {
  await api.delete(`${API_ENDPOINTS.CART}/${userId}/clear`);
};

/**
 * POST /api/cart/:userId/sync
 *
 * Merges the guest (LocalStorage) cart into the authenticated backend cart.
 *
 * Required backend endpoint (Spring Boot):
 *   POST /api/cart/{userId}/sync
 *   Request body : { "items": [ { "productId": string, "quantity": number } ] }
 *   Merge rule   : If a product already exists in the backend cart, ADD the
 *                  guest quantity to the existing quantity, then cap at the
 *                  lesser of maxOrderQuantity and available stock.
 *                  If it does not exist, insert it as a new cart item.
 *   Response     : 200 CartResponse (same shape as getCart) after the merge
 *                  is fully persisted — never 200 before persistence.
 *
 * This function throws on any non-2xx response so cartSync.js can preserve
 * the guest LocalStorage payload for a retry on the next login.
 *
 * @param {string}  userId
 * @param {Array<{ productId: string, quantity: number }>} items
 * @returns {Promise<object>} CartResponse from the backend
 */
export const syncGuestCart = async (userId, items) => {
  const { data } = await api.post(`${API_ENDPOINTS.CART}/${userId}/sync`, {
    items,
  });
  return data;
};
