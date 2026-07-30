import { formatCurrency } from "@/utils/currency";
import { useNavigate } from "react-router-dom";
import PATHS from "@/routes/paths";

/**
 * OrderSummary
 *
 * isGuest: when true, the checkout button shows a lock hint and
 * the label changes to 'Login to Checkout'. The actual redirect
 * to /login is handled by CartPage.handleCheckout.
 */
const OrderSummary = ({ items, cartTotal, onCheckout, onClearCart, loading, isGuest = false }) => {
  const navigate = useNavigate();

  const itemsTotal = cartTotal;
  const shipping = 0;
  const shippingDisplay = shipping === 0 ? "FREE" : formatCurrency(shipping);
  const tax = Math.round(itemsTotal * 0.18 * 100) / 100;
  const discount = 0;
  const grandTotal = itemsTotal + shipping + tax - discount;

  return (
    <div className="sticky top-20 rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-fit">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

      <div className="space-y-4 border-b border-gray-200 pb-4">
        <div className="flex justify-between text-gray-700">
          <span>Items Total ({items.length} {items.length === 1 ? "item" : "items"})</span>
          <span className="font-semibold">{formatCurrency(itemsTotal)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Shipping</span>
          <span className="font-semibold text-green-600">{shippingDisplay}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>Tax (18%)</span>
          <span className="font-semibold">{formatCurrency(tax)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Discount</span>
            <span className="font-semibold text-green-600">−{formatCurrency(discount)}</span>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-gray-900">Grand Total</span>
          <span className="text-2xl font-bold text-gray-900">{formatCurrency(grandTotal)}</span>
        </div>

        <button
          onClick={onCheckout}
          disabled={loading || items.length === 0}
          className="w-full font-bold py-3 rounded-lg transition mb-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
          style={{
            background: isGuest ? '#f97316' : '#f97316',
            color: '#fff',
          }}
        >
          {isGuest ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Login to Checkout
            </span>
          ) : 'Proceed to Checkout'}
        </button>

        <button
          onClick={onClearCart}
          disabled={loading}
          className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 font-semibold py-3 rounded-lg transition"
        >
          Clear Cart
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure Checkout
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
