import { useState, useEffect }                    from 'react';
import { useQuery, useMutation, useQueryClient }   from '@tanstack/react-query';
import { useAuthStore }                            from '@/store/authStore';
import { queryKeys }                               from '@/lib/queryKeys';
import { useToastStore }                           from '@/store/toastStore';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '@/features/wishlist/services/wishlistService';
import { getProductById }    from '@/services/productService';
import {
  getGuestWishlist,
  isInGuestWishlist,
  toggleGuestWishlist,
} from '@/features/wishlist/services/guestWishlistService';

// Backend WishlistItem: { productId, name, price, imageUrl, brand, category }
const normalizeWishlistItem = (item) => ({
  productId:   item.productId                    ?? '',
  productName: item.productName ?? item.name     ?? '',  // backend → .name
  imageUrl:    item.imageUrl                     ?? '',
  brand:       item.brand                        ?? '',
  category:    item.category                     ?? '',
  unitPrice:   item.unitPrice   ?? item.price    ?? 0,   // backend → .price
});

// Normalize a raw product document (GET /api/products/:id) into the same
// WishlistItem shape so WishlistPage can render both sources identically.
const normalizeProductToWishlistItem = (product) => ({
  productId:   product.id   ?? product._id ?? '',
  productName: product.name ?? product.productName ?? '',
  imageUrl:    product.imageUrl ?? '',
  brand:       product.brand    ?? '',
  category:    product.category ?? '',
  unitPrice:   product.price    ?? product.unitPrice ?? 0,
});

// ── Authenticated Wishlist ────────────────────────────────────────────────

export const useWishlistQuery = () => {
  const user   = useAuthStore((s) => s.user);
  const userId = user?.id;

  return useQuery({
    queryKey: queryKeys.wishlist.byUser(userId),
    queryFn:  async () => {
      const data = await getWishlist(userId);
      // Backend returns { id, userId, items: [...] }
      const raw = data?.items ?? (Array.isArray(data) ? data : []);
      return raw.map(normalizeWishlistItem);
    },
    enabled:   !!userId,
    staleTime: 1000 * 60 * 2,
    retry: (count, err) => err?.response?.status === 401 ? false : count < 2,
  });
};

export const useAddToWishlist = () => {
  const queryClient       = useQueryClient();
  const user              = useAuthStore((s) => s.user);
  const userId            = user?.id;
  const showWishlistToast = useToastStore((s) => s.showWishlistToast);

  return useMutation({
    mutationFn: ({ productId }) => addToWishlist(userId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.byUser(userId) });
      showWishlistToast('add');
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient       = useQueryClient();
  const user              = useAuthStore((s) => s.user);
  const userId            = user?.id;
  const showWishlistToast = useToastStore((s) => s.showWishlistToast);

  return useMutation({
    mutationFn: ({ productId }) => removeFromWishlist(userId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.byUser(userId) });
      showWishlistToast('remove');
    },
  });
};

// ── Guest Wishlist (unauthenticated) ──────────────────────────────────────

/**
 * useGuestWishlist
 *
 * Fetches live product details for each ID stored in LocalStorage.
 * Each ID becomes an individual parallel query so TanStack Query can
 * cache and deduplicate them alongside ProductDetail page queries.
 *
 * Returns items in the same shape as useWishlistQuery so WishlistPage
 * can use one shared rendering path for both guest and authenticated users.
 */
export const useGuestWishlist = () => {
  const productIds = getGuestWishlist();  // string[]

  return useQuery({
    queryKey: ['wishlist', 'guest', productIds],
    queryFn: async () => {
      if (!productIds.length) return [];
      const results = await Promise.allSettled(
        productIds.map((id) => getProductById(id))
      );
      return results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => normalizeProductToWishlistItem(r.value));
    },
    enabled: productIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });
};

// ── useToggleWishlist — Shared abstraction ────────────────────────────────
/**
 * useToggleWishlist
 *
 * Single wishlist toggle abstraction consumed by ProductDetailPage,
 * ProductCard, and WishlistHeart. Eliminates duplicated guest/auth
 * branching logic across components.
 *
 * Guest behaviour (user is null):
 *   - Toggle product ID in LocalStorage via guestWishlistService.
 *   - Show wishlist toast.
 *   - No redirect to /login.
 *   - isWishlisted is derived from LocalStorage (re-renders on toggle).
 *
 * Authenticated behaviour (user is set):
 *   - Call backend add/remove via TanStack mutations.
 *   - isWishlisted is derived from TanStack Query cache (live, server-sourced).
 *   - Query is invalidated automatically by the mutations.
 *
 * After refresh:
 *   - Guest: heart stays filled because LocalStorage is re-read on mount.
 *   - Auth:  heart stays filled because TanStack Query cache is rehydrated.
 *
 * @param {string} productId - The product to toggle
 * @returns {{ isWishlisted: boolean, toggle: () => Promise<void>, busy: boolean }}
 */
export const useToggleWishlist = (productId) => {
  const user              = useAuthStore((s) => s.user);
  const showWishlistToast = useToastStore((s) => s.showWishlistToast);

  // ── Authenticated path ───────────────────────────────────────────────
  const { data: wishlistItems = [] } = useWishlistQuery();
  const { mutateAsync: add,    isPending: addPending    } = useAddToWishlist();
  const { mutateAsync: remove, isPending: removePending } = useRemoveFromWishlist();
  const busy = addPending || removePending;

  // ── Guest path ───────────────────────────────────────────────────────
  // Local state so the heart re-renders immediately after a LocalStorage write.
  const [guestIn, setGuestIn] = useState(() => isInGuestWishlist(productId));

  // Re-sync guestIn if productId changes (e.g., navigating between detail pages)
  useEffect(() => {
    setGuestIn(isInGuestWishlist(productId));
  }, [productId]);

  // Also re-sync when the custom DOM event fires (Navbar badge → heart sync)
  useEffect(() => {
    const sync = () => setGuestIn(isInGuestWishlist(productId));
    window.addEventListener('guestWishlistUpdated', sync);
    return () => window.removeEventListener('guestWishlistUpdated', sync);
  }, [productId]);

  // ── Derived state ────────────────────────────────────────────────────
  const isWishlisted = user
    ? wishlistItems.some((item) => String(item.productId) === String(productId))
    : guestIn;

  // ── Toggle handler ───────────────────────────────────────────────────
  const toggle = async () => {
    if (!user) {
      // Guest: LocalStorage toggle + toast, no redirect
      const nowIn = toggleGuestWishlist(productId);
      setGuestIn(nowIn);
      showWishlistToast(nowIn ? 'add' : 'remove');
      return;
    }

    // Authenticated: backend mutation (toast is fired by mutation onSuccess)
    if (isWishlisted) {
      await remove({ productId });
    } else {
      await add({ productId });
    }
  };

  return { isWishlisted, toggle, busy };
};
