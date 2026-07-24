import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductDetailQuery } from "@/hooks/useQueryProducts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAddToCart, useCartQuery, useRemoveFromCart } from "@/features/cart/hooks/useCart";
import { useToggleWishlist } from "@/features/wishlist/hooks/useWishlist";
import ProductImageGallery from "../components/ProductImageGallery";
import ProductInfo from "../components/ProductInfo";
import PurchaseCard from "../components/PurchaseCard";
import ReviewList from "@/features/reviews/components/ReviewList";
import SimilarProducts from "../components/SimilarProducts";
import { ProductDetailSkeleton } from "@/components/skeleton";
import SEO from "@/components/common/SEO";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { useProductSEO } from "@/hooks/useSEO";
import PATHS from "@/routes/paths";
import "../styles/ProductDetail.css";

// Note: No CartToast import needed — toast fires globally via
// useAddToCart → toastStore → CartToastPortal in App.jsx

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const {
    data: product = null,
    isLoading: loading,
    isError,
    error: queryError,
  } = useProductDetailQuery(id);
  const error = isError ? (queryError?.message ?? 'Product not found') : null;
  const { user } = useAuth();

  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();

  // ── Persistent in-cart check ──────────────────────────────────────────────
  const { data: cartData } = useCartQuery();
  const isInCart = (cartData?.items ?? []).some(
    (item) => String(item.productId) === String(id)
  );

  // ── Wishlist ──────────────────────────────────────────────────────────────
  // useToggleWishlist handles both guest (LocalStorage) and authenticated
  // (backend) paths. Guests are NOT redirected — they get the same heart
  // toggle + toast experience as WishlistHeart.jsx.
  const { isWishlisted, toggle: handleWishlistToggle, busy: wishBusy } =
    useToggleWishlist(id);

  // ── Button loading state ─────────────────────────────────────────────────
  const [addingToCart, setAddingToCart] = useState(false);
  const [removingFromCart, setRemovingFromCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [errorToast, setErrorToast] = useState(false);

  const triggerErrorToast = () => {
    setErrorToast(true);
    setTimeout(() => setErrorToast(false), 2750);
  };

  const handleAddToCart = async () => {
    if (!user) { navigate(PATHS.LOGIN); return; }
    if (isInCart) return;
    setAddingToCart(true);
    try {
      // Toast fires automatically from useAddToCart onSuccess
      await addToCartMutation.mutateAsync({ product, quantity: 1 });
    } catch {
      triggerErrorToast();
    } finally {
      setAddingToCart(false);
    }
  };

  const handleRemoveFromCart = async () => {
    if (!user) { navigate(PATHS.LOGIN); return; }
    if (!isInCart) return;
    setRemovingFromCart(true);
    try {
      await removeFromCartMutation.mutateAsync({ productId: id });
    } catch {
      triggerErrorToast();
    } finally {
      setRemovingFromCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { navigate(PATHS.LOGIN); return; }
    setBuyingNow(true);
    try {
      await addToCartMutation.mutateAsync({ product, quantity: 1 });
      navigate(PATHS.CART);
    } catch {
      triggerErrorToast();
    } finally {
      setBuyingNow(false);
    }
  };

  const idMismatch = product && String(product.id) !== String(id);
  
  // Call hook before any conditional returns (React Hooks Rule)
  const { seoProps } = useProductSEO(product);

  if (loading || idMismatch) return <ProductDetailSkeleton />;

  if (error) {
    return (
      <div className="pdp-page">
        <button className="pdp-back" onClick={() => navigate(PATHS.PRODUCTS)}>← Back to Products</button>
        <div className="pdp-error">
          <span className="pdp-error__icon">⚠️</span>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={() => navigate(PATHS.PRODUCTS)}>Browse Products</button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Build breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', path: PATHS.HOME },
    { label: 'Products', path: PATHS.PRODUCTS },
    { label: product.category, path: `${PATHS.PRODUCTS}?category=${encodeURIComponent(product.category)}` },
  ];
  if (product.subcategory) {
    breadcrumbItems.push({
      label: product.subcategory,
      path: `${PATHS.PRODUCTS}?category=${encodeURIComponent(product.category)}&subcategory=${encodeURIComponent(product.subcategory)}`,
    });
  }
  breadcrumbItems.push({ label: product.name, isCurrent: true });

  return (
    <article className="pdp-page sk-loaded">
      <SEO {...seoProps} />
      <button className="pdp-back" onClick={() => navigate(PATHS.PRODUCTS)}>← Back to Products</button>

      <Breadcrumbs items={breadcrumbItems} className="pdp-breadcrumb" />

      <button
        className={`pdp-wish-btn${isWishlisted ? ' pdp-wish-btn--active' : ''}`}
        onClick={handleWishlistToggle}
        disabled={wishBusy}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        {isWishlisted ? 'Wishlisted' : 'Wishlist'}
      </button>

      <div className="pdp-grid">
        <div className="pdp-grid__images">
          <ProductImageGallery imageUrl={product.imageUrl} name={product.name} />
        </div>
        <div className="pdp-grid__info">
          <ProductInfo product={product} />
        </div>
        <div className="pdp-grid__card">
          <PurchaseCard
            product={product}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onBuyNow={handleBuyNow}
            addingToCart={addingToCart}
            removingFromCart={removingFromCart}
            buyingNow={buyingNow}
            isInCart={isInCart}
          />
        </div>
      </div>

      {product.category && (
        <SimilarProducts category={product.category} currentProductId={product.id} />
      )}

      <div className="pdp-reviews">
        <ReviewList productId={id} currentUser={user ?? null} />
      </div>

      {/* Error toast — inline style, no CSS dependency */}
      {errorToast && (
        <div role="alert" style={{
          position: 'fixed',
          bottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 99999, background: '#dc2626', color: '#fff',
          borderRadius: '9999px', padding: '13px 24px',
          fontWeight: 600, fontSize: '0.9375rem',
          boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          ✕ Failed to add to cart. Please try again.
        </div>
      )}
    </article>
  );
};

export default ProductDetailPage;
