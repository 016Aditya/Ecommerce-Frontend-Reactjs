import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate }                from 'react-router-dom';
import { useAuth }                    from '@/features/auth/hooks/useAuth';
import { useCartQuery }               from '@/features/cart/hooks/useCart';
import { useAddresses }               from '@/features/address/hooks/useAddresses';
import { useCheckout }                from '../hooks/useCheckout';
import CheckoutItems                  from '../components/CheckoutItems';
import CheckoutAddress                from '../components/CheckoutAddress';
import OrderSummary                   from '../components/OrderSummary';
import { calculateOrderTotals }       from '../utils/calculateOrderTotals';
import { formatCurrency }             from '@/utils/currency';
import SEO                            from '@/components/common/SEO';
import { useSEO }                     from '@/hooks/useSEO';
import PATHS                          from '@/routes/paths';
import '../styles/Checkout.css';

const CheckoutPage = () => {
  const navigate                          = useNavigate();
  const { user }                          = useAuth();
  const { data: cart, isLoading }         = useCartQuery();
  const { data: addresses = [] }          = useAddresses();
  const { placing, error, setError, placeOrder } = useCheckout();

  const items     = cart?.items     ?? [];
  const cartTotal = cart?.cartTotal ?? 0;
  const { total } = calculateOrderTotals(cartTotal);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const { seoProps } = useSEO({
    title: 'Checkout | Shop Fashion',
    description: 'Complete your purchase securely.',
    robots: 'noindex,nofollow',
  });

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) navigate(PATHS.LOGIN, { state: { from: PATHS.CHECKOUT } });
  }, [user, navigate]);

  // Hide the sticky checkout bar while the mobile keyboard is open
  // (address fields pushing the viewport up would otherwise trap it mid-screen).
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;

    const baseHeight = window.innerHeight;
    const handleResize = () => {
      setKeyboardOpen(viewport.height < baseHeight * 0.75);
    };

    viewport.addEventListener('resize', handleResize);
    return () => viewport.removeEventListener('resize', handleResize);
  }, []);

  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    setError(null);
  };

  const handlePlaceOrder = () => {
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? null;
    placeOrder({ user, items, selectedAddress });
  };

  // Block checkout if any item is out of stock
  const hasOutOfStockItems = items.some((item) => item.inStock === false);

  if (isLoading) return (
    <div className="checkout-page">
      <div className="checkout-loading">
        <div className="checkout-loading__spinner" />
        <p>Loading your cart…</p>
      </div>
    </div>
  );

  if (!items.length) return (
    <div className="checkout-page">
      <div className="checkout-empty">
        <p>Your cart is empty.</p>
        <button className="btn btn--primary" onClick={() => navigate(PATHS.PRODUCTS)}>
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <main className="checkout-page">
      <SEO {...seoProps} />
      <h1 className="checkout-page__title">Checkout</h1>

      {error && <div className="checkout-error" role="alert">{error}</div>}

      {hasOutOfStockItems && (
        <div className="checkout-error checkout-error--warning" role="alert">
          ⚠️ Some items in your cart are no longer available.
          Please remove them before proceeding.
        </div>
      )}

      <div className="checkout-layout">
        <div className="checkout-layout__main">
          <section className="checkout-section">
            <h2 className="checkout-page__section-label checkout-page__section-label--order-items">📬 Delivery Address</h2>
            <CheckoutAddress
              selectedAddressId={selectedAddressId}
              onSelect={handleAddressSelect}
            />
          </section>
          <section className="checkout-section">
            <h2 className="checkout-page__section-label checkout-page__section-label--order-items">
              🛒 Order Items ({items.length})
            </h2>
            <CheckoutItems items={items} />
          </section>
        </div>
        <div className="checkout-layout__sidebar">
          <OrderSummary
            items={items}
            cartTotal={cartTotal}
            onPlaceOrder={handlePlaceOrder}
            onBackToCart={() => navigate(PATHS.CART)}
            loading={placing}
            disabled={placing || hasOutOfStockItems}
          />
        </div>
      </div>

      <div
        className={`checkout-sticky-bar${keyboardOpen ? ' checkout-sticky-bar--hidden' : ''}`}
        aria-hidden={keyboardOpen}
      >
        <div className="checkout-sticky-bar__row">
          <div className="checkout-sticky-bar__info">
            <span className="checkout-sticky-bar__label">Total</span>
            <span className="checkout-sticky-bar__amount">{formatCurrency(total)}</span>
          </div>
          <button
            type="button"
            className="checkout-sticky-bar__cta"
            onClick={handlePlaceOrder}
            onTouchStart={() => {}}
            disabled={placing || hasOutOfStockItems}
          >
            {placing ? 'Placing…' : 'Place Order'}
          </button>
        </div>
        <p className="checkout-sticky-bar__secure">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="checkout-sticky-bar__secure-icon">
            <path
              d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3z"
              stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
            />
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          100% secure payment
        </p>
      </div>
    </main>
  );
};

export default CheckoutPage;
