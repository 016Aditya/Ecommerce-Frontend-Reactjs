/**
 * HomeProductCard — simplified product card, homepage-only.
 *
 * Deliberately not the same component as
 * `@/features/products/components/ProductCard` used on /products: this
 * variant drops the category/subcategory pills and uses a lighter-weight
 * Add to Cart button, trading some density for a cleaner homepage. The
 * fuller card on /products is left exactly as it is.
 *
 * Cart/wishlist wiring mirrors ProductCard.jsx (same hooks, same guest
 * cart behaviour) since this still needs to be a real, working card —
 * just a quieter one.
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

const HomeProductCard = memo(({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cardRef = useRef(null);
  const prefetch = usePrefetchProductDetail();

  const addToCartMutation = useAddToCart();
  const busy = addToCartMutation.isPending;

  const { data: cartData } = useCartQuery();
  const authInCart = (cartData?.items ?? []).some(
    (item) => String(item.productId) === String(product.id)
  );

  const [guestInCart, setGuestInCart] = useState(() =>
    !user ? isInGuestCart(String(product.id)) : false
  );

  useEffect(() => {
    if (user) return;
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

  const goToDetail = () => navigate(buildPath(PATHS.PRODUCT_DETAIL, product.id));

  const handleAddToCart = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (busy || product.inStock === false || isInCart) return;
    addToCartMutation.mutate({ product, quantity: 1 });
  };

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const buttonLabel = () => {
    if (product.inStock === false) return 'Out of Stock';
    if (busy) return 'Adding…';
    if (isInCart) return '✓ In Cart';
    return 'Add to Cart';
  };

  const buttonStyle = () => {
    if (product.inStock === false) return { background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', cursor: 'not-allowed' };
    if (busy) return { background: 'var(--accent)', color: 'var(--accent-text)', opacity: 0.6, cursor: 'not-allowed' };
    if (isInCart) return { background: '#22c55e', color: '#fff', cursor: 'not-allowed' };
    return { background: 'var(--accent)', color: 'var(--accent-text)' };
  };

  const buttonDisabled = busy || product.inStock === false || isInCart;

  return (
    <div
      ref={cardRef}
      className="group flex h-full w-full min-w-0 flex-col overflow-hidden transition-all duration-[180ms]"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        transition: 'border-color 180ms ease, transform 180ms ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--border-color) 70%, white 30%)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div
        className="relative flex w-full cursor-pointer items-center justify-center overflow-hidden"
        style={{
          aspectRatio: '1 / 1',
          margin: '7px',
          width: 'calc(100% - 14px)',
          borderRadius: '10px',
          padding: '10px',
          background: 'linear-gradient(135deg, var(--featured-image-start) 0%, var(--featured-image-end) 100%)',
        }}
        onClick={goToDetail}
        onMouseEnter={() => prefetch(product.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') goToDetail(); }}
      >
        {discount ? (
          <div className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white z-10">
            {discount}% off
          </div>
        ) : null}
        <WishlistHeart productId={product.id} productName={product.name} />
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            width={280}
            height={280}
            decoding="async"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 220ms ease' }}
            className="group-hover:scale-[1.02]"
          />
        ) : (
          <span className="text-5xl" aria-hidden="true">🛍️</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-1">
        <p
          className="cursor-pointer line-clamp-2"
          style={{
            color: 'var(--text-primary)',
            fontSize: '14.5px',
            fontWeight: 700,
            lineHeight: 1.35,
            minHeight: '2.7em',
          }}
          onClick={goToDetail}
        >
          {product.name}
        </p>

        <RatingBadge rating={product.averageRating || 0} count={product.reviewCount || 0} size="sm" />

        <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#22c55e' }}>
            {formatCurrencyTrimmed(product.price)}
          </span>
          {discount ? (
            <span className="line-through" style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
              {formatCurrencyTrimmed(product.originalPrice)}
            </span>
          ) : null}
        </div>

        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          ✓ Free Delivery
        </p>

        <button
          type="button"
          className="mt-1.5 w-full rounded-md text-xs font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed"
          style={{ minHeight: '32px', ...buttonStyle() }}
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

HomeProductCard.displayName = 'HomeProductCard';

export default HomeProductCard;
