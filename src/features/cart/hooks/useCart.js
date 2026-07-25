/**
 * useCart.js
 *
 * Unified cart hook that serves BOTH authenticated users (TanStack Query /
 * backend) and unauthenticated guests (guestCartService / LocalStorage).
 *
 * Architectural rules preserved:
 *  - No LocalStorage reads inside JSX/render — all reads go through
 *    guestCartService and are subscribed via guestCartUpdated + storage events.
 *  - UI components never see a branch on storage source — they call the same
 *    addItem/updateItem/removeItem/clearCart/isInCart API regardless.
 *  - Authenticated path is identical to what existed before; no mutation
 *    behaviour has changed for logged-in users.
 *  - Hook rules are satisfied: all hooks are called unconditionally;
 *    "enabled" flags gate the network calls at the query level.
 */
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearCart,
} from '@/services/cartService';
import {
  getGuestCart,
  addGuestCartItem,
  updateGuestCartItem,
  removeGuestCartItem,
  clearGuestCart,
  isInGuestCart,
} from '@/services/guestCartService';
import { getProductById } from '@/services/productService';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useToastStore } from '@/store/toastStore';

/**
 * normalizeItem
 *
 * The backend CartItemResponse only returns { productId, quantity, unitPrice }.
 * productName, imageUrl, brand, and category must be fetched separately.
 */
const normalizeItem = (item) => ({
  productId:        item.productId        ?? '',
  productName:      item.productName      ?? '',
  imageUrl:         item.imageUrl         ?? '',
  brand:            item.brand            ?? '',
  category:         item.category         ?? '',
  unitPrice:        item.unitPrice        ?? 0,
  quantity:         item.quantity         ?? 1,
  stock:            item.stock            ?? 0,
  maxOrderQuantity: item.maxOrderQuantity ?? 10,
});

// ── Query key factory (also re-exported from queryKeys.js) ────────────────
export const cartKeys = {
  all: (userId) => ['cart', userId],
};

// ── Authenticated cart query ──────────────────────────────────────────────
/**
 * useCartQuery
 *
 * For authenticated users: fetches the backend cart and enriches each item
 * with live product details if not already embedded.
 * For guests: disabled (returns { data: undefined, isLoading: false }).
 * Consumers read guest items through useCart() which provides a unified shape.
 */
export const useCartQuery = () => {
  const user   = useAuthStore((s) => s.user);
  const userId = user?.id;

  return useQuery({
    queryKey: cartKeys.all(userId),
    queryFn:  async () => {
      const data = await getCart(userId);
      const rawItems = data?.items ?? [];

      const enriched = await Promise.all(
        rawItems.map(async (item) => {
          if (item.productName) return normalizeItem(item);
          try {
            const product = await getProductById(item.productId);
            return {
              productId:        item.productId,
              productName:      product?.name      ?? product?.title ?? '',
              imageUrl:         product?.imageUrl  ?? product?.image ?? '',
              brand:            product?.brand     ?? '',
              category:         product?.category  ?? '',
              unitPrice:        item.unitPrice     ?? product?.price ?? 0,
              quantity:         item.quantity      ?? 1,
              stock:            product?.stock            ?? 0,
              maxOrderQuantity: product?.maxOrderQuantity ?? 10,
            };
          } catch {
            return normalizeItem(item);
          }
        })
      );

      return { ...data, items: enriched };
    },
    enabled:   !!userId,
    staleTime: 1000 * 30,
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
};

// ── Guest cart state hook ─────────────────────────────────────────────────
/**
 * useGuestCart
 *
 * Manages guest item IDs + quantities from guestCartService.
 * Subscribes to "guestCartUpdated" DOM events so the UI re-renders
 * immediately after every write in the same tab, and to the native
 * "storage" event for cross-tab sync.
 *
 * Returns normalized items (with live product data fetched), plus
 * reactive count helpers.
 */
const useGuestCart = () => {
  const [guestEntries, setGuestEntries] = useState(() => getGuestCart());

  // Subscribe to writes from guestCartService
  useEffect(() => {
    const sync = () => setGuestEntries(getGuestCart());
    window.addEventListener('guestCartUpdated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('guestCartUpdated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Fetch live product details for each guest entry
  // We use a separate query for guest product enrichment
  const guestProductIds = guestEntries.map((e) => e.productId);

  // useQuery for guest product enrichment — always called, enabled only when guest has items
  const { data: guestProducts = {} } = useQuery({
    queryKey: ['guestCartProducts', guestProductIds],
    queryFn: async () => {
      const results = {};
      await Promise.all(
        guestProductIds.map(async (id) => {
          try {
            results[id] = await getProductById(id);
          } catch {
            results[id] = null;
          }
        })
      );
      return results;
    },
    enabled: guestProductIds.length > 0,
    staleTime: 1000 * 60 * 5, // product details are stable for 5 min
  });

  const enrichedItems = guestEntries
    .map((entry) => {
      const p = guestProducts[entry.productId];
      if (!p) return null; // product not yet loaded or not found — skip gracefully
      return {
        productId:        String(entry.productId),
        productName:      p.name      ?? p.title ?? '',
        imageUrl:         p.imageUrl  ?? p.image ?? '',
        brand:            p.brand     ?? '',
        category:         p.category  ?? '',
        unitPrice:        p.price     ?? 0,
        quantity:         entry.quantity,
        stock:            p.stock            ?? 0,
        maxOrderQuantity: p.maxOrderQuantity ?? 10,
        inStock:          p.inStock ?? true,
      };
    })
    .filter(Boolean);

  const totalQuantity = guestEntries.reduce((s, e) => s + e.quantity, 0);

  return { guestEntries, enrichedItems, totalQuantity };
};

// ── Add item mutation ────────────────────────────────────────────────────
/**
 * useAddToCart
 *
 * Single add-to-cart hook for both auth and guest users.
 * - Authenticated: calls backend addItemToCart, invalidates query, fires toast.
 * - Guest: calls guestCartService.addGuestCartItem, which dispatches
 *   guestCartUpdated so every subscribed component re-renders immediately.
 */
export const useAddToCart = () => {
  const queryClient     = useQueryClient();
  const user            = useAuthStore((s) => s.user);
  const logout          = useAuthStore((s) => s.logout);
  const addOptimistic   = useCartStore((s) => s.addOptimistic);
  const clearOptimistic = useCartStore((s) => s.clearOptimistic);
  const showCartToast   = useToastStore((s) => s.showCartToast);
  const userId = user?.id;

  return useMutation({
    mutationFn: ({ product, quantity = 1 }) => {
      if (!userId) {
        // Guest path: synchronous LocalStorage write
        const productId = typeof product === 'string' ? product : product.id;
        addGuestCartItem(String(productId), quantity);
        // Return a resolved promise to satisfy useMutation's expected interface
        return Promise.resolve();
      }
      // Authenticated path: backend API
      const productId = typeof product === 'string' ? product : product.id;
      return addItemToCart(userId, productId, quantity);
    },
    onMutate: ({ product, quantity = 1 }) => {
      // Optimistic snapshot only for authenticated users (guest state
      // is driven by the guestCartUpdated event subscription)
      if (userId && typeof product !== 'string') {
        addOptimistic(product, quantity);
      }
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: cartKeys.all(userId) });
      }
      // Toast fires for both guest and authenticated adds
      showCartToast();
    },
    onError: (error) => {
      if (error?.response?.status === 401) logout();
    },
    onSettled: () => {
      if (userId) clearOptimistic();
    },
  });
};

// ── Update item quantity ──────────────────────────────────────────────────
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const user        = useAuthStore((s) => s.user);
  const logout      = useAuthStore((s) => s.logout);
  const showToast   = useToastStore((s) => s.showToast);
  const userId = user?.id;

  return useMutation({
    mutationFn: ({ productId, quantity }) => {
      if (!userId) {
        updateGuestCartItem(String(productId), quantity);
        return Promise.resolve();
      }
      return updateCartItem(userId, productId, quantity);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: cartKeys.all(userId) });
      }
    },
    onError: (error) => {
      if (!userId) return;
      if (error?.response?.status === 401) {
        logout();
        return;
      }
      const data = error?.response?.data;
      if (data?.code === 'INSUFFICIENT_STOCK' || data?.code === 'MAX_QUANTITY_EXCEEDED') {
        showToast({
          type: 'warning',
          title: data?.code === 'MAX_QUANTITY_EXCEEDED' ? 'Purchase Limit' : 'Stock Limit',
          message: data.message,
        });
      }
    },
  });
};

// ── Remove item ────────────────────────────────────────────────────────────
export const useRemoveFromCart = () => {
  const queryClient      = useQueryClient();
  const user             = useAuthStore((s) => s.user);
  const logout           = useAuthStore((s) => s.logout);
  const removeOptimistic = useCartStore((s) => s.removeOptimistic);
  const showToast        = useToastStore((s) => s.showToast);
  const userId = user?.id;

  return useMutation({
    mutationFn: ({ productId }) => {
      if (!userId) {
        removeGuestCartItem(String(productId));
        return Promise.resolve();
      }
      return removeItemFromCart(userId, productId);
    },
    onMutate: ({ productId }) => {
      if (userId) removeOptimistic(productId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: cartKeys.all(userId) });
      }
      showToast({ type: 'info', title: '', message: 'Removed from cart' });
    },
    onError: (error) => {
      if (error?.response?.status === 401) logout();
    },
  });
};

// ── Clear cart ─────────────────────────────────────────────────────────────
export const useClearCart = () => {
  const queryClient     = useQueryClient();
  const user            = useAuthStore((s) => s.user);
  const logout          = useAuthStore((s) => s.logout);
  const clearOptimistic = useCartStore((s) => s.clearOptimistic);
  const userId = user?.id;

  return useMutation({
    mutationFn: () => {
      if (!userId) {
        clearGuestCart();
        return Promise.resolve();
      }
      return clearCart(userId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: cartKeys.all(userId) });
        clearOptimistic();
      }
    },
    onError: (error) => {
      if (error?.response?.status === 401) logout();
    },
  });
};

// ── useGuestCartCount — lightweight for Navbar badge ─────────────────────
/**
 * useGuestCartCount
 *
 * Returns the live total item count for the guest cart.
 * Subscribes to guestCartUpdated + storage events.
 * Used by Navbar to show the badge for unauthenticated users.
 */
export const useGuestCartCount = () => {
  const [count, setCount] = useState(() =>
    getGuestCart().reduce((s, e) => s + e.quantity, 0)
  );

  useEffect(() => {
    const sync = () =>
      setCount(getGuestCart().reduce((s, e) => s + e.quantity, 0));
    window.addEventListener('guestCartUpdated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('guestCartUpdated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return count;
};

// ── DEFAULT EXPORT — useCart() unified facade ─────────────────────────────
/**
 * useCart
 *
 * Unified facade. Returns the same shape whether the user is a guest or
 * authenticated. CartPage, ProductCard, and ProductDetailPage call this
 * without branching on auth state.
 *
 * Public API:
 *   items          — normalized cart items ready for rendering
 *   cartData       — raw backend response (null for guests)
 *   isLoading      — true while fetching or mutating
 *   isFetching     — true while refetching in background
 *   error          — error message string or null
 *   addItem(product, quantity?)   — add or increment item
 *   updateItem(productId, qty)    — update item quantity
 *   removeItem(productId)         — remove item
 *   clearCart()                   — clear all items
 *   isInCart(productId)           — boolean check
 *   totalItems                    — count of distinct products
 *   totalQuantity                 — sum of all quantities
 *   isMutating                    — true while any mutation is in-flight
 */
const useCart = () => {
  const user   = useAuthStore((s) => s.user);
  const userId = user?.id;

  // Always call all hooks — gating is done via enabled flags inside each hook
  const {
    data: cartData,
    isLoading: authLoading,
    isFetching: authFetching,
    isError,
    error: queryError,
  } = useCartQuery();

  const { enrichedItems: guestItems, totalQuantity: guestTotalQty } = useGuestCart();

  const addMutation    = useAddToCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveFromCart();
  const clearMutation  = useClearCart();

  const isMutating =
    addMutation.isPending ||
    updateMutation.isPending ||
    removeMutation.isPending ||
    clearMutation.isPending;

  // ── Unified item list ──────────────────────────────────────────────────
  const items = userId ? (cartData?.items ?? []) : guestItems;

  // ── isInCart ───────────────────────────────────────────────────────────
  const isInCart = useCallback(
    (productId) => {
      if (userId) {
        return (cartData?.items ?? []).some(
          (item) => String(item.productId) === String(productId)
        );
      }
      return isInGuestCart(String(productId));
    },
    [userId, cartData]
  );

  // ── Totals ─────────────────────────────────────────────────────────────
  const totalItems    = items.length;
  const totalQuantity = userId
    ? items.reduce((s, i) => s + (i.quantity ?? 0), 0)
    : guestTotalQty;

  // ── Error message ──────────────────────────────────────────────────────
  const error = isError
    ? (queryError?.response?.data?.message ?? 'Failed to load cart')
    : null;

  // ── Loading ────────────────────────────────────────────────────────────
  const isLoading = (userId ? authLoading : false) || isMutating;

  return {
    // Data
    items,
    cartData: cartData ?? null,
    isLoading,
    isFetching: authFetching ?? false,
    error,
    // Mutations (unified API matching existing consumer call sites)
    addItem:   (product, quantity = 1) => addMutation.mutate({ product, quantity }),
    updateItem: (productId, quantity)  => updateMutation.mutate({ productId, quantity }),
    removeItem: (productId)            => removeMutation.mutate({ productId }),
    clearCart:  ()                     => clearMutation.mutate(),
    // Helpers
    isInCart,
    totalItems,
    totalQuantity,
    isMutating,
    // Backward-compatible aliases from old API
    emptyCart: () => clearMutation.mutate(),
    cartTotal: cartData?.cartTotal ?? 0,
    loading: isLoading,
  };
};

export default useCart;
