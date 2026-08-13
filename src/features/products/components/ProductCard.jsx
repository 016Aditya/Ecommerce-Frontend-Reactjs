/**
 * ProductCard.jsx
 *
 * Guest cart support:
 *  - Guests can add items directly — no login redirect.
 *  - isInCart reads from guestCartService for guests,
 *    from TanStack Query cache for authenticated users.
 *  - Only Checkout requires authentication (handled in CartPage).
 *
 * Toast is handled globally via CartToastPortal + toastStore.
 * useAddToCart.onSuccess calls showCartToast() automatically.
 */
import { memo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PATHS, { buildPath } from '@/routes/paths';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAddToCart, useCartQuery } from '@/features/cart/hooks/useCart';
import { isInGuestCart } from '@/features/cart/services/guestCartService';
import { formatCurrencyTrimmed } from '@/utils/currency';
import RatingBadge from '@/components/common/RatingBadge';
import { usePrefetchProductDetail } from '@/hooks/useQueryProducts';
import WishlistHeart from '@/components/WishlistHeart';

const ProductCard = memo(({ product, compact = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cardRef = useRef(null);
  const prefetch = usePrefetchProductDetail();

  const addToCartMutation = useAddToCart();
  const busy = addToCartMutation.isPending;

  // Authenticated: derive isInCart from live TanStack Query cache.
  const { data: cartData } = useCartQuery();
  const authInCart = (cartData?.items ?? []).some(
    (item) => String(item.productId) === String(product.id)
  );

  // Guest: derive isInCart from guestCartService + re-render on changes.
  const [guestInCart, setGuestInCart] = useState(() =>
    !user ? isInGuestCart(String(product.id)) : false
  );

  useEffect(() => {
    if (user) return; // authenticated path uses TanStack cache
    const sync = () => setGuestInCart(isInGuestCart(String(product.id)));
    window.addEventListener('guestCartUpdated', sync);
    return () => window.removeEventListener('guestCartUpdated', sync);
  }, [user, product.id]);

  const isInCart = user ? authInCart : guestInCart;

  useEffect(() => {
    const element = cardRef.current;
    if (!element || !('IntersectionObserver' in window)) return;
    if (!window.matchMedia('(hover: none)').matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          prefetch(product.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(element);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const goToDetail = () => {
    navigate(buildPath(PATHS.PRODUCT_DETAIL, product.id));
  };

  const handleAddToCart = (event) => {
    event.stopPropagation();
    event.preventDefault();
    // No login redirect — guests can add to cart freely.
    // Only Checkout requires authentication (enforced in CartPage).
    if (busy || product.inStock === false || isInCart) return;
    addToCartMutation.mutate({ product, quantity: 1 });
  };

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : null;

  const buttonLabel = () => {
    if (product.inStock === false) return 'OUT OF STOCK';
    if (busy) return 'Adding...';
    if (isInCart) return '\u2713 Added to Cart';
    return 'ADD TO CART';
  };

  const buttonStyle = () => {
    if (product.inStock === false) return { background: '#9ca3af', cursor: 'not-allowed', color: '#fff' };
    if (busy)    return { background: '#86efac', cursor: 'not-allowed', color: '#fff' };
    if (isInCart) return { background: '#22c55e', cursor: 'not-allowed', color: '#fff' };
    return { background: '#ff9f00', color: '#fff' };
  };

  const buttonBase = 'w-full inline-flex items-center justify-center min-h-[38px] rounded-[10px] px-[14px] text-[13px] font-bold disabled:cursor-not-allowed active:scale-[0.985]';
  const buttonTransition = 'transition-all duration-[180ms] ease-in-out';
  const buttonDisabled = busy || product.inStock === false || isInCart;

  if (compact) {
    return (
      <div
        ref={cardRef}
        className="group flex flex-col items-center rounded-sm border p-3 hover:shadow-md transition"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
      >
        <div
          className="w-full cursor-pointer"
          onClick={goToDetail}
          onMouseEnter={() => prefetch(product.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') goToDetail(); }}
        >
          <div
            className="relative flex w-full items-center justify-center overflow-hidden rounded mb-2"
            style={{
              aspectRatio: '1 / 1',
              padding: '8px',
              background: 'linear-gradient(135deg, var(--featured-image-start) 0%, var(--featured-image-end) 100%)',
              borderRadius: '8px',
            }}
          >
            {discount ? (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                {discount}% OFF
              </div>
            ) : null}
            <WishlistHeart productId={product.id} productName={product.name} />
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                width={200}
                height={200}
                decoding="async"
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 220ms ease' }}
                className="group-hover:scale-[1.04]"
              />
            ) : (
              <span className="text-4xl">🛍️</span>
            )}
          </div>
          <p
            className="text-center line-clamp-2 group-hover:text-[#2874f0] transition"
            style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-primary)' }}
          >
            {product.name}
          </p>
          <div className="mt-1 w-full">
            <RatingBadge rating={product.averageRating || 0} count={product.reviewCount || 0} showCount={false} />
          </div>
          <p className="mt-1" style={{ fontSize: '18px', fontWeight: 700, color: '#22c55e' }}>
            {formatCurrencyTrimmed(product.price)}
          </p>
        </div>
        <button
          className={`${buttonBase} ${buttonTransition} product-card__btn`}
          style={{ marginTop: '8px', ...buttonStyle() }}
          onClick={handleAddToCart}
          disabled={buttonDisabled}
          aria-label={isInCart ? `${product.name} is in your cart` : `Add ${product.name} to cart`}
        >
          {buttonLabel()}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className="group flex flex-col rounded-[18px] border shadow-sm transition hover:shadow-md active:scale-[0.985]"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'color-mix(in srgb, var(--border-color) 65%, transparent)',
        transition: 'border-color 180ms ease, transform 180ms ease, box-shadow 180ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--border-color) 70%, white 30%)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div
        className="flex flex-1 flex-col cursor-pointer"
        onClick={goToDetail}
        onMouseEnter={() => prefetch(product.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') goToDetail(); }}
      >
        <div
          className="relative flex w-full items-center justify-center overflow-hidden"
          style={{
            aspectRatio: '1 / 1',
            marginTop: '7px',
            marginLeft: '7px',
            marginRight: '7px',
            marginBottom: '8px',
            width: 'calc(100% - 14px)',
            borderRadius: '10px',
            padding: '8px',
            background: 'linear-gradient(135deg, var(--featured-image-start) 0%, var(--featured-image-end) 100%)',
          }}
        >
          {discount ? (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10">
              {discount}% OFF
            </div>
          ) : null}
          <WishlistHeart productId={product.id} productName={product.name} />
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              width={300}
              height={300}
              decoding="async"
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 220ms ease' }}
              className="group-hover:scale-[1.04]"
            />
          ) : (
            <span className="text-6xl">🛍️</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3.5">
          <h3
            className="line-clamp-2 group-hover:text-[#2874f0] transition"
            style={{
              fontSize: '14px',
              fontWeight: 800,
              lineHeight: '20px',
              color: 'var(--text-primary)',
              minHeight: '40px',
              marginBottom: '4px',
            }}
          >
            {product.name}
          </h3>
          <div className="mt-0.5">
            <RatingBadge
              rating={product.averageRating || 0}
              count={product.reviewCount || 0}
              size="lg"
              gapClassName="gap-1.5"
              countClassName="text-gray-500"
            />
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#22c55e' }}>
              {formatCurrencyTrimmed(product.price)}
            </p>
            {product.originalPrice && product.originalPrice > product.price ? (
              <p className="line-through" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                {formatCurrencyTrimmed(product.originalPrice)}
              </p>
            ) : null}
            {discount ? (
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#22c55e' }}>
                {discount}% off
              </p>
            ) : null}
          </div>
          <p
            className="text-green-500"
            style={{ fontSize: '13.5px', fontWeight: 700, marginBlock: '2px' }}
          >
            ✓ Free Delivery
          </p>
          {product.inStock === false && (
            <p className="text-xs font-semibold text-red-500">Out of Stock</p>
          )}
          <div className="flex items-center gap-1 flex-wrap">
            <span
              className="w-fit rounded-full"
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--badge-bg)',
                paddingInline: '11px',
                paddingBlock: '4px',
              }}
            >
              {product.category}
            </span>
            {product.subcategory && (
              <span
                className="w-fit rounded-full"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--badge-bg)',
                  paddingInline: '11px',
                  paddingBlock: '4px',
                }}
              >
                {product.subcategory}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="px-3.5 pb-3.5">
        <button
          className={`${buttonBase} ${buttonTransition} product-card__btn`}
          style={buttonStyle()}
          onClick={handleAddToCart}
          disabled={buttonDisabled}
          aria-label={isInCart ? `${product.name} is in your cart` : `Add ${product.name} to cart`}
        >
          {buttonLabel()}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
