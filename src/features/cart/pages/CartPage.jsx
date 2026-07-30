import { useNavigate } from "react-router-dom";
import useCart from "@/features/cart/hooks/useCart";
import { useAuth } from "@/features/auth/hooks/useAuth";
import PATHS from "@/routes/paths";
import SEO from "@/components/common/SEO";
import { useSEO } from "@/hooks/useSEO";
import CartItem from "@/features/cart/components/CartItem";
import OrderSummary from "@/features/cart/components/OrderSummary";
import CartItemSkeleton, { OrderSummarySkeleton } from "@/components/skeleton/CartItemSkeleton";

const CartPage = () => {
  const { items, cartTotal, loading, error, removeItem, updateItem, emptyCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { seoProps } = useSEO({
    title: 'Shopping Cart | Shop Fashion',
    description: 'Review your shopping cart and proceed to checkout.',
    robots: 'noindex,nofollow',
  });

  // Only Checkout requires authentication.
  // Guests see the full cart page and can manage items freely.
  const handleCheckout = () => {
    if (!user) {
      navigate(PATHS.LOGIN, { state: { from: PATHS.CHECKOUT } });
      return;
    }
    navigate(PATHS.CHECKOUT);
  };

  const isGuest = !user;

  /* ── Loading ── */
  if (loading) {
    return (
      <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <SEO {...seoProps} />
        <div className="container-app py-8">
          <div className="sk mb-2" style={{ height: 28, width: 180 }} />
          <div className="sk mb-8" style={{ height: 14, width: 80 }} />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
              >
                <div
                  className="px-6 py-4"
                  style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-tertiary)" }}
                >
                  <div className="sk" style={{ height: 16, width: 90 }} />
                </div>
                <div className="px-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <CartItemSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <OrderSummarySkeleton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="container-app py-8">
        <div
          className="rounded-lg p-6"
          style={{ background: "var(--error-bg)", border: "1px solid var(--error-border)" }}
        >
          <p className="font-semibold" style={{ color: "var(--error-text)" }}>{error}</p>
          <button
            onClick={() => navigate(PATHS.HOME)}
            className="mt-4 font-medium"
            style={{ color: "var(--error-text)" }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  /* ── Empty ── */
  if (!items || items.length === 0) {
    return (
      <div className="container-app py-16">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <svg className="h-24 w-24" style={{ color: "var(--text-tertiary)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Your Cart is Empty</h2>
          <p className="mb-8" style={{ color: "var(--text-secondary)" }}>Add some products to get started shopping!</p>
          <button
            onClick={() => navigate(PATHS.PRODUCTS)}
            className="inline-block font-bold py-3 px-8 rounded-lg transition"
            style={{ background: "var(--button-primary)", color: "var(--button-primary-text)" }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  /* ── Content ── */
  return (
    <main className="min-h-screen sk-loaded" style={{ background: "var(--bg-primary)" }}>
      <SEO {...seoProps} />
      <div className="container-app py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Shopping Cart</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Guest banner */}
        {isGuest && (
          <div
            className="mb-6 flex items-center gap-3 rounded-lg px-4 py-3"
            style={{
              background: 'var(--info-bg, #eff6ff)',
              border: '1px solid var(--info-border, #bfdbfe)',
            }}
          >
            <svg className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--info-text, #2563eb)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm" style={{ color: 'var(--info-text, #1e40af)' }}>
              You’re shopping as a guest. Your cart is saved locally.
              {' '}
              <button
                onClick={() => navigate(PATHS.LOGIN, { state: { from: PATHS.CART } })}
                className="font-semibold underline"
                style={{ color: 'var(--info-text, #1e40af)' }}
              >
                Log in
              </button>
              {' '}to save your cart to your account.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div
              className="rounded-lg shadow-sm overflow-hidden"
              style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)" }}
            >
              <div
                className="px-6 py-4"
                style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-tertiary)" }}
              >
                <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Cart Items</h2>
              </div>
              <div style={{ borderColor: "var(--border-color)" }} className="divide-y">
                {items.map((item) => (
                  <div key={item.productId} className="px-6">
                    <CartItem
                      item={item}
                      onUpdateQuantity={updateItem}
                      onRemove={removeItem}
                      onSaveForLater={() => {}}
                      isGuest={isGuest}
                    />
                  </div>
                ))}
              </div>
              <div
                className="px-6 py-4"
                style={{ background: "var(--bg-tertiary)", borderTop: "1px solid var(--border-color)" }}
              >
                <button
                  onClick={() => navigate(PATHS.PRODUCTS)}
                  className="font-medium text-sm transition"
                  style={{ color: "var(--info-text)" }}
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              cartTotal={cartTotal}
              onCheckout={handleCheckout}
              onClearCart={emptyCart}
              loading={loading}
              isGuest={isGuest}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
