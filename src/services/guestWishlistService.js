/**
 * guestWishlistService.js
 *
 * Encapsulates all LocalStorage operations for the guest (unauthenticated)
 * wishlist. Stores an array of plain product ID strings — NOT full product
 * objects — to keep the payload small and ensure prices/images stay fresh.
 *
 * Storage key : "guestWishlist"
 * Shape       : string[]   e.g. ["64b123", "64b555", "64c888"]
 *
 * This module has zero React / Zustand dependencies; it is safe to call
 * from service files, Zustand actions, or React hooks.
 */

const STORAGE_KEY = 'guestWishlist';

/** Return the current guest wishlist (array of productId strings). */
export const getGuestWishlist = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // Defensive: ignore anything that isn't a plain string array
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

/** Add a product ID to the guest wishlist (no-op if already present). */
export const addToGuestWishlist = (productId) => {
  if (!productId) return;
  const items = getGuestWishlist();
  if (!items.includes(productId)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...items, productId]));
  }
};

/** Remove a product ID from the guest wishlist. */
export const removeFromGuestWishlist = (productId) => {
  const updated = getGuestWishlist().filter((id) => id !== productId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

/** Toggle a product ID in the guest wishlist. Returns true if now in list. */
export const toggleGuestWishlist = (productId) => {
  const items = getGuestWishlist();
  if (items.includes(productId)) {
    removeFromGuestWishlist(productId);
    return false;
  } else {
    addToGuestWishlist(productId);
    return true;
  }
};

/** Return true if productId is in the guest wishlist. */
export const isInGuestWishlist = (productId) => getGuestWishlist().includes(productId);

/** Clear the entire guest wishlist (called after successful sync). */
export const clearGuestWishlist = () => localStorage.removeItem(STORAGE_KEY);
