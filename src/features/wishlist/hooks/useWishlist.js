import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore }   from '@/store/authStore';
import { queryKeys }      from '@/lib/queryKeys';
import { useToastStore }  from '@/store/toastStore';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '@/services/wishlistService';
import { getProductById }    from '@/services/productService';
import { getGuestWishlist }  from '@/services/guestWishlistService';

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

  // Run one query per ID in parallel. useQueries is not available without
  // import, so we map into individual useQuery calls inside a single
  // combined hook using Promise.all inside a single useQuery.
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
