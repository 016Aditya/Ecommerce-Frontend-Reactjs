/**
 * guestCartService.js
 *
 * Encapsulates all LocalStorage operations for the guest (unauthenticated)
 * cart.  Stores an array of minimal cart-item objects — NOT full product
 * objects — to keep the payload small and ensure prices stay fresh from
 * the server.
 *
 * Storage key : "guestCart"
 * Shape       : Array<{ productId: string, quantity: number }>
 *
 * After every write operation a custom DOM event "guestCartUpdated" is
 * dispatched on window so any component (Navbar badge, CartPage, etc.)
 * can subscribe and re-render without polling.
 *
 * This module has zero React / TanStack Query / Zustand dependencies.
 */

const STORAGE_KEY = 'guestCart';

/** Notify listeners (Navbar badge, CartPage, etc.) that LocalStorage changed. */
const notify = () => {
  window.dispatchEvent(new CustomEvent('guestCartUpdated'));
};

/**
 * Return the current guest cart array.
 * Falls back to [] on malformed JSON or non-array data.
 * @returns {Array<{productId: string, quantity: number}>}
 */
export const getGuestCart = () => {
  try {
    const raw    = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    // Validate shape: keep only items with a string productId and positive integer quantity
    return parsed.filter(
      (item) =>
        item &&
        typeof item.productId === 'string' &&
        item.productId.trim() !== '' &&
        typeof item.quantity  === 'number' &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
};

/**
 * Add a product to the guest cart.
 * If the product already exists, increment its quantity by the given amount.
 * @param {string} productId
 * @param {number} [quantity=1]
 */
export const addGuestCartItem = (productId, quantity = 1) => {
  if (!productId || typeof productId !== 'string' || productId.trim() === '') return;
  const qty = Math.max(1, Math.floor(Number(quantity)) || 1);

  const items   = getGuestCart();
  const idx     = items.findIndex((item) => item.productId === productId);

  let updated;
  if (idx === -1) {
    // New product — append
    updated = [...items, { productId, quantity: qty }];
  } else {
    // Already in cart — increment
    updated = items.map((item, i) =>
      i === idx ? { ...item, quantity: item.quantity + qty } : item
    );
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notify();
  return updated;
};

/**
 * Set the quantity of a cart item explicitly.
 * If quantity <= 0, the item is removed.
 * @param {string} productId
 * @param {number} quantity
 */
export const updateGuestCartItem = (productId, quantity) => {
  if (!productId) return;
  const qty = Math.floor(Number(quantity));

  if (qty <= 0) {
    return removeGuestCartItem(productId);
  }

  const items   = getGuestCart();
  const updated = items.map((item) =>
    item.productId === productId ? { ...item, quantity: qty } : item
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notify();
  return updated;
};

/**
 * Remove a product from the guest cart entirely.
 * @param {string} productId
 */
export const removeGuestCartItem = (productId) => {
  const updated = getGuestCart().filter((item) => item.productId !== productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notify();
  return updated;
};

/** Clear the entire guest cart (called ONLY after confirmed backend sync success). */
export const clearGuestCart = () => {
  localStorage.removeItem(STORAGE_KEY);
  notify();
};

/**
 * Return the number of distinct products in the guest cart.
 * @returns {number}
 */
export const getGuestCartItemCount = () => getGuestCart().length;

/**
 * Return the total quantity across all items in the guest cart.
 * @returns {number}
 */
export const getGuestCartTotalQuantity = () =>
  getGuestCart().reduce((sum, item) => sum + item.quantity, 0);

/**
 * Return true if a given productId is already in the guest cart.
 * @param {string} productId
 * @returns {boolean}
 */
export const isInGuestCart = (productId) =>
  getGuestCart().some((item) => item.productId === productId);
