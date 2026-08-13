import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/utils/currency";
import PATHS from "@/routes/paths";

const PLACEHOLDER = "https://placehold.co/64x64/f3f4f6/9ca3af?text=Item";

const CheckoutItems = ({ items }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  // Desktop-only: clicking anywhere on the row opens the product page.
  const handleRowClick = (event, productId) => {
    if (!productId || window.innerWidth < 768) return;
    if (event.target.closest('button, a, input, [role="button"]')) return;
    navigate(`${PATHS.PRODUCTS}/${productId}`);
  };

  return (
    <div className="checkout-items">
      <div className="checkout-section__header">
        <span className="checkout-section__num">2</span>
        <h2 className="checkout-section__title">Order Items</h2>
      </div>
      <ul className="checkout-items__list">
        {items.map((item, i) => (
          <li
            key={item.productId ?? i}
            className="checkout-items__row checkout-items__row--clickable"
            onClick={(e) => handleRowClick(e, item.productId)}
          >
            <img
              src={item.imageUrl ?? PLACEHOLDER}
              alt={item.productName ?? "Product"}
              className="checkout-items__img"
              loading="lazy"
            />
            <div className="checkout-items__meta">
              <p className="checkout-items__name">
                {item.productName ?? item.productId}
              </p>
              <p className="checkout-items__qty">Qty: {item.quantity}</p>
            </div>
            <span className="checkout-items__price">
              {formatCurrency((item.unitPrice ?? 0) * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CheckoutItems;
