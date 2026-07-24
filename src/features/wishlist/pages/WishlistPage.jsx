import { useState }        from 'react';
import { useNavigate }     from 'react-router-dom';
import { useAuth }         from '@/features/auth/hooks/useAuth';
import { useAddToCart }    from '@/features/cart/hooks/useCart';
import { buildPath }       from '@/routes/paths';
import PATHS               from '@/routes/paths';
import { formatCurrency }  from '@/utils/currency';
import SEO from '@/components/common/SEO';
import { useSEO } from '@/hooks/useSEO';
import {
  useWishlistQuery,
  useRemoveFromWishlist,
  useGuestWishlist,
} from '@/features/wishlist/hooks/useWishlist';
import {
  removeFromGuestWishlist,
  getGuestWishlist,
} from '@/services/guestWishlistService';
import '../styles/Wishlist.css';

// ── Shared row renderer for both guest and authenticated wishlists ──────────
const WishlistRow = ({ item, busy, isMoving, isRemoving, onMoveToCart, onRemove }) => {
  const navigate = useNavigate();
  return (
    <div className={`wl-row ${busy ? 'wl-row--busy' : ''}`}>
      <div
        className="wl-img-wrap"
        onClick={() => navigate(buildPath(PATHS.PRODUCT_DETAIL, item.productId))}
        role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(buildPath(PATHS.PRODUCT_DETAIL, item.productId))}
      >
        <img
          src={item.imageUrl || '/placeholder-product.png'}
          alt={item.productName}
          loading="lazy" width="130" height="130"
        />
      </div>

      <div className="wl-info">
        <div className="wl-meta">
          {item.brand    && <span className="wl-brand">{item.brand}</span>}
          {item.category && <span className="wl-category">{item.category}</span>}
        </div>
        <p
          className="wl-name"
          onClick={() => navigate(buildPath(PATHS.PRODUCT_DETAIL, item.productId))}
          role="button" tabIndex={0}
        >
          {item.productName}
        </p>
        <p className="wl-price">{formatCurrency(item.unitPrice)}</p>
      </div>

      <div className="wl-actions">
        {onMoveToCart && (
          <button className="wl-btn-move" onClick={() => onMoveToCart(item)} disabled={busy}>
            {isMoving ? 'Moving…' : 'Move to Cart'}
          </button>
        )}
        <button className="wl-btn-remove" onClick={() => onRemove(item.productId)} disabled={busy}>
          {isRemoving ? 'Removing…' : 'Remove'}
        </button>
      </div>
    </div>
  );
};

// ── Guest wishlist panel ────────────────────────────────────────────────────
const GuestWishlistPanel = () => {
  const navigate = useNavigate();
  const { data: items = [], isLoading, refetch } = useGuestWishlist();
  const [removingId, setRemovingId] = useState(null);

  const guestIds = getGuestWishlist();

  if (isLoading) return <div className="wl-center"><p>Loading your wishlist…</p></div>;

  if (!guestIds.length) return (
    <div className="wl-center">
      <div className="wl-empty-icon">💔</div>
      <p className="wl-empty-title">Your wishlist is empty</p>
      <p className="wl-empty-sub">Save items you love and come back to them anytime.</p>
      <button className="wl-btn-primary" onClick={() => navigate(PATHS.PRODUCTS)}>Browse Products</button>
    </div>
  );

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    removeFromGuestWishlist(productId);
    // Re-fetch to update the live product list after LocalStorage mutation
    await refetch();
    setRemovingId(null);
  };

  return (
    <main className="wl-page">
      <p className="wl-count">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
      <p className="wl-guest-note">
        <span role="img" aria-label="lock">🔒</span>{' '}
        <a href={PATHS.LOGIN} style={{ color: 'inherit', textDecoration: 'underline' }}>
          Sign in
        </a>{' '}to keep your wishlist forever across all devices.
      </p>
      <div className="wl-list">
        {items.map((item) => (
          <WishlistRow
            key={item.productId}
            item={item}
            busy={removingId === item.productId}
            isMoving={false}
            isRemoving={removingId === item.productId}
            onMoveToCart={null}  // guests cannot move to cart (requires auth)
            onRemove={handleRemove}
          />
        ))}
      </div>
    </main>
  );
};

// ── Authenticated wishlist panel ────────────────────────────────────────────
const AuthWishlistPanel = ({ user }) => {
  const navigate = useNavigate();

  const { seoProps } = useSEO({
    title: 'My Wishlist | Shop Fashion',
    description: 'View your saved wishlist items and shop your favorite products.',
    robots: 'noindex,nofollow',
  });

  const { data: items = [], isLoading, isError } = useWishlistQuery();
  const removeMutation    = useRemoveFromWishlist();
  const addToCartMutation = useAddToCart();

  const [movingId,   setMovingId]   = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try   { await removeMutation.mutateAsync({ productId }); }
    finally { setRemovingId(null); }
  };

  const handleMoveToCart = async (item) => {
    setMovingId(item.productId);
    try {
      await addToCartMutation.mutateAsync({
        product: {
          id:       item.productId,
          name:     item.productName,
          imageUrl: item.imageUrl,
          brand:    item.brand,
          category: item.category,
          price:    item.unitPrice,
        },
        quantity: 1,
      });
      await removeMutation.mutateAsync({ productId: item.productId });
    } finally {
      setMovingId(null);
    }
  };

  if (isLoading) return <div className="wl-center"><p>Loading your wishlist…</p></div>;
  if (isError) return (
    <div className="wl-center">
      <p className="wl-error-msg">Failed to load wishlist.</p>
      <button className="wl-btn-primary" onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  if (!items.length) return (
    <div className="wl-center">
      <div className="wl-empty-icon">💔</div>
      <p className="wl-empty-title">Your wishlist is empty</p>
      <p className="wl-empty-sub">Save items you love and come back to them anytime.</p>
      <button className="wl-btn-primary" onClick={() => navigate(PATHS.PRODUCTS)}>Browse Products</button>
    </div>
  );

  return (
    <main className="wl-page">
      <SEO {...seoProps} />
      <p className="wl-count">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>

      <div className="wl-list">
        {items.map((item) => {
          const isMoving   = movingId   === item.productId;
          const isRemoving = removingId === item.productId;
          return (
            <WishlistRow
              key={item.productId}
              item={item}
              busy={isMoving || isRemoving}
              isMoving={isMoving}
              isRemoving={isRemoving}
              onMoveToCart={handleMoveToCart}
              onRemove={handleRemove}
            />
          );
        })}
      </div>
    </main>
  );
};

// ── Page entry point ────────────────────────────────────────────────────────
const WishlistPage = () => {
  const { user } = useAuth();

  // Guests see their LocalStorage wishlist; authenticated users see MongoDB wishlist.
  return user ? <AuthWishlistPanel user={user} /> : <GuestWishlistPanel />;
};

export default WishlistPage;
