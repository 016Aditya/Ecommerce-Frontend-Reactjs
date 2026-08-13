import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PATHS, { buildPath } from "@/routes/paths";
import { formatCurrency } from "@/utils/currency";
import OrderStatusBadge from "./OrderStatusBadge";
import { ORDER_IMAGE_PLACEHOLDER } from "../utils/normalizeOrder";

/**
 * OrderCard
 *
 * FIX: Added amber "Returning" / "Returned" secondary badge for return
 * statuses. The primary OrderStatusBadge already shows the exact status
 * (e.g. "Return Requested"), but the spec also requires a prominent
 * contextual label in the card body. We render it next to the badge.
 */

const RETURN_IN_PROGRESS = new Set([
  "RETURN_REQUESTED",
  "RETURN_APPROVED",
  "PICKUP_SCHEDULED",
  "PICKED_UP",
  "REFUND_PROCESSED",
]);

const RETURN_COMPLETE = new Set(["RETURN_SUCCESSFUL", "RETURNED"]);

const OrderCard = ({ order }) => {
  const navigate = useNavigate();

  const firstItem = order.items?.[0];
  const [imageSrc, setImageSrc] = useState(
    firstItem?.imageUrl ?? ORDER_IMAGE_PLACEHOLDER
  );

  const shortId = order.id?.slice(-8).toUpperCase() || "UNKNOWN";

  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "N/A";

  const productSummary = useMemo(() => {
    if (!order.items?.length) {
      return order.quantity > 0
        ? `${order.quantity} item${order.quantity !== 1 ? "s" : ""}`
        : "View order details \u2192";
    }
    const [first, ...rest] = order.items;
    return rest.length > 0
      ? `${first.productName} +${rest.length} more`
      : first.productName;
  }, [order.items, order.quantity]);

  const qtyLabel = order.quantity > 0
    ? `${order.quantity} item${order.quantity !== 1 ? "s" : ""}`
    : firstItem
      ? `${firstItem.quantity} item${firstItem.quantity !== 1 ? "s" : ""}`
      : "";

  const upperStatus = order.status?.toUpperCase() ?? "";
  const returnBadgeLabel = RETURN_COMPLETE.has(upperStatus)
    ? "Returned"
    : RETURN_IN_PROGRESS.has(upperStatus)
      ? "Returning"
      : null;

  const detailPath = buildPath(PATHS.ORDER_DETAIL, order.id);

  // Desktop-only: clicking anywhere on the card opens order details,
  // unless the click originated from a button/link/input inside it.
  const handleCardClick = (event) => {
    if (window.innerWidth < 768) return;
    if (event.target.closest('button, a, input, [role="button"]')) return;
    navigate(detailPath);
  };

  return (
    <div className="order-card order-card--clickable" onClick={handleCardClick}>
      {/* ── Header row ── */}
      <div className="order-card__header">
        <div className="order-card__header-left">
          <span className="order-card__label">Order placed</span>
          <span className="order-card__value">{date}</span>
        </div>
        <div className="order-card__header-mid">
          <span className="order-card__label">Total</span>
          <span className="order-card__value">{formatCurrency(order.totalPrice)}</span>
        </div>
        <div className="order-card__header-right">
          <span className="order-card__id">Order #{shortId}</span>
        </div>
      </div>

      {/* ── Body row ── */}
      <div className="order-card__body">
        <img
          src={imageSrc}
          alt={firstItem?.productName ?? "Ordered product"}
          className="order-card__img"
          width={52}
          height={52}
          loading="lazy"
          onError={() => setImageSrc(ORDER_IMAGE_PLACEHOLDER)}
        />

        <div className="order-card__info">
          <div className="order-card__status-row">
            <OrderStatusBadge status={order.status} />
            {/* Amber return badge — shown alongside the primary status badge */}
            {returnBadgeLabel && (
              <span className="order-card__return-badge">
                {returnBadgeLabel}
              </span>
            )}
            {qtyLabel && (
              <span className="order-card__qty">{qtyLabel}</span>
            )}
          </div>

          <p className="order-card__product-name" title={productSummary}>
            {productSummary}
          </p>

          {firstItem?.unitPrice > 0 && (
            <p className="order-card__item-price">
              {formatCurrency(firstItem.unitPrice)}{order.items?.length > 1 ? " / item" : ""}
            </p>
          )}
        </div>

        <div className="order-card__actions">
          <button
            className="btn order-card__btn order-card__btn--detail"
            onClick={() => navigate(detailPath)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
