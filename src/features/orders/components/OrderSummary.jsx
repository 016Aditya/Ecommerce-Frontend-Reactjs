import { formatCurrency } from "@/utils/currency";
import { calculateOrderTotals } from "../utils/calculateOrderTotals";

const OrderSummary = ({
  items = [],
  cartTotal = 0,
  onPlaceOrder,
  onBackToCart,
  loading,
}) => {
  const { subtotal, shipping, tax, total } = calculateOrderTotals(cartTotal);

  return (
    <div className="order-summary">
      <h2 className="order-summary__title">Order Summary</h2>

      <div className="order-summary__rows">
        <div className="order-summary__row">
          <span>Subtotal ({items.length} item{items.length === 1 ? "" : "s"})</span>
          <span className="order-summary__amount">{formatCurrency(subtotal)}</span>
        </div>
        <div className="order-summary__row">
          <span>Delivery</span>
          <span className={`order-summary__amount${shipping === 0 ? " order-summary__free" : ""}`}>
            {shipping === 0 ? "FREE" : formatCurrency(shipping)}
          </span>
        </div>
        <div className="order-summary__row">
          <span>Tax (18% GST)</span>
          <span className="order-summary__amount">{formatCurrency(tax)}</span>
        </div>
      </div>

      <div className="order-summary__divider" />

      <div className="order-summary__total">
        <span>Total</span>
        <span className="order-summary__total-amount">{formatCurrency(total)}</span>
      </div>

      {shipping === 0 && (
        <p className="order-summary__free-note">🎉 You qualify for FREE delivery!</p>
      )}

      {onPlaceOrder && (
        <>
          <button
            className="btn order-summary__btn order-summary__btn--place"
            onClick={onPlaceOrder}
            onTouchStart={() => {}}
            disabled={loading}
          >
            {loading ? "Placing Order…" : "Place Order"}
          </button>
          <p className="order-summary__secure">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="order-summary__secure-icon">
              <path
                d="M12 3l7 3v5c0 4.6-3 8.4-7 10-4-1.6-7-5.4-7-10V6l7-3z"
                stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
              />
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            100% secure payment &middot; SSL encrypted
          </p>
          <button
            className="btn order-summary__btn order-summary__btn--back"
            onClick={onBackToCart}
            disabled={loading}
          >
            ← Back to Cart
          </button>
        </>
      )}
    </div>
  );
};

export default OrderSummary;
