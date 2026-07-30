import { useUpdateCartItem, useRemoveFromCart } from "../hooks/useCart";
import { useToastStore }    from '@/store/toastStore';
import { useToggleWishlist } from "@/features/wishlist/hooks/useWishlist";
import { formatCurrency }   from "@/utils/currency";
import { isAtQuantityLimit, validateQuantity } from '../utils/cartValidation';

/**
 * CartItem — guest-aware, fully unified.
 *
 * "Save for Later" behaviour by auth state:
 *   - Guest  → calls useToggleWishlist (guestWishlistService / localStorage);
 *             item is wishlisted without requiring any login. The item stays
 *             in the cart so the guest doesn't lose it unexpectedly.
 *   - Auth   → same useToggleWishlist (backend path);
 *             item is wishlisted then removed from cart (existing UX).
 *
 * Remove and qty controls work for guests via useCart's guest path
 * (guestCartService / localStorage).
 */
const CartItem = ({ item, isGuest = false }) => {
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveFromCart();
  const showToast      = useToastStore((s) => s.showToast);

  // useToggleWishlist handles both guest (localStorage) and auth (backend) paths.
  const { isWishlisted, toggle: toggleWishlist, busy: wishBusy } =
    useToggleWishlist(item.productId);

  const {
    productId,
    productName,
    brand,
    category,
    unitPrice,
    quantity,
    imageUrl,
  } = item;

  const price    = unitPrice ?? 0;
  const subtotal = price * (quantity ?? 1);

  const isUpdating = updateMutation.isPending;
  const isRemoving = removeMutation.isPending;
  const isBusy     = isUpdating || isRemoving || wishBusy;

  const handleUpdateQty = (newQty) => {
    if (newQty < 1 || isBusy) return;
    updateMutation.mutate({ productId, quantity: newQty });
  };

  const handleIncrement = () => {
    if (isBusy) return;
    const validation = validateQuantity({
      quantity,
      stock:            item.stock,
      maxOrderQuantity: item.maxOrderQuantity,
    });
    if (!validation.valid) {
      showToast({ type: 'warning', title: validation.title, message: validation.message });
      return;
    }
    handleUpdateQty(quantity + 1);
  };

  const handleRemove = () => {
    if (isBusy) return;
    removeMutation.mutate({ productId });
  };

  /**
   * Save for Later:
   *   - Guests  → toggle guest wishlist (localStorage). Item stays in cart.
   *   - Auth    → toggle backend wishlist then remove from cart.
   */
  const handleSaveForLater = async () => {
    if (isBusy) return;
    if (isGuest) {
      // Guest: wishlist toggle only, no cart removal (item kept for safety)
      await toggleWishlist();
      return;
    }
    // Auth: wishlist + remove from cart
    await toggleWishlist();
    if (!isWishlisted) {
      // We just wishlisted it — remove from cart
      removeMutation.mutate({ productId });
    }
  };

  const atLimit = isAtQuantityLimit(quantity, item.stock, item.maxOrderQuantity);

  const saveLabel = () => {
    if (wishBusy) return isWishlisted ? 'Removing\u2026' : 'Saving\u2026';
    return isWishlisted ? '\u2665 Wishlisted' : 'Save for Later';
  };

  return (
    <div className="flex gap-4 border-b border-gray-200 py-4 sm:gap-6 sm:py-6">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <div className="h-24 w-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden sm:h-32 sm:w-32">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={productName || 'Product'}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828
                0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex-1">
          <div className="flex gap-2 mb-1">
            {brand && (
              <span className="inline-block text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {brand}
              </span>
            )}
            {category && (
              <span className="inline-block text-xs text-gray-500 px-2 py-1">{category}</span>
            )}
          </div>
          <h3 className="text-base font-semibold text-gray-900 leading-tight mb-2 line-clamp-2">
            {productName || 'Loading product...'}
          </h3>
          <p className="text-lg font-bold text-gray-900 mb-3">
            {formatCurrency(price)}
            <span className="text-xs font-normal text-gray-600 ml-2">per item</span>
          </p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => handleUpdateQty(quantity - 1)}
              disabled={quantity <= 1 || isBusy}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Decrease quantity"
            >
              {isUpdating ? '\u2026' : '\u2212'}
            </button>
            <span className="px-4 py-2 font-semibold text-gray-900 min-w-[40px] text-center">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={isBusy}
              className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              aria-label="Increase quantity"
              title={
                atLimit
                  ? (item.stock === quantity
                      ? `Only ${item.stock} item${item.stock === 1 ? '' : 's'} available`
                      : `Maximum ${item.maxOrderQuantity} items allowed`)
                  : undefined
              }
            >
              {isUpdating ? '\u2026' : '+'}
            </button>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Subtotal</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(subtotal)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 flex gap-3">
          {/* Save for Later: guest → guestWishlist, auth → backend wishlist */}
          <button
            onClick={handleSaveForLater}
            disabled={isBusy}
            className="text-sm font-medium transition disabled:opacity-50"
            style={{ color: isWishlisted ? '#e11d48' : '#2563eb' }}
          >
            {saveLabel()}
          </button>
          <button
            onClick={handleRemove}
            disabled={isBusy}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition disabled:opacity-50"
          >
            {isRemoving ? 'Removing\u2026' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
