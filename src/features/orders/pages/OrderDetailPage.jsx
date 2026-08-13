import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PATHS, { buildPath } from "@/routes/paths";
import { formatCurrency } from "@/utils/currency";
import OrderItemsList       from "../components/OrderItemsList";
import OrderStatusBadge     from "../components/OrderStatusBadge";
import OrderPricingSummary  from "../components/OrderPricingSummary";
import OrderTimeline        from "../components/OrderTimeline";
import ReturnModal          from "../components/ReturnModal";
import ShippingInfo         from "../components/ShippingInfo";
import { useOrder, useCancelOrder } from "../hooks/useOrders";
import { useReturn }        from "../hooks/useReturn";
import { ORDER_IMAGE_PLACEHOLDER } from "../utils/normalizeOrder";
import { useToastStore }    from '@/store/toastStore';
import "../styles/Orders.css";

const CANCELLABLE = new Set(["PENDING", "CONFIRMED"]);
const RETURNABLE  = new Set(["DELIVERED"]);

const RETURN_STATUSES = new Set([
  "RETURN_REQUESTED", "RETURN_APPROVED", "PICKUP_SCHEDULED",
  "PICKED_UP", "REFUND_PROCESSED", "RETURN_SUCCESSFUL", "RETURNED",
]);

const STATUS_LABELS = {
  PENDING:           "Pending",
  CONFIRMED:         "Confirmed",
  PACKED:            "Packed",
  SHIPPED:           "Shipped",
  DELIVERED:         "Delivered",
  CANCELLED:         "Cancelled",
  RETURN_REQUESTED:  "Return Requested",
  RETURN_APPROVED:   "Return Approved",
  PICKUP_SCHEDULED:  "Pickup Scheduled",
  PICKED_UP:         "Picked Up",
  REFUND_PROCESSED:  "Refund Processed",
  RETURN_SUCCESSFUL: "Return Successful",
  RETURNED:          "Returned",
};

const REFUND_STATUS_LABELS = {
  PENDING: "Pending", APPROVED: "Approved",
  PROCESSED: "Processed", REJECTED: "Rejected",
};

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  }) : null;

/** Reusable section card with icon + title header */
const SectionCard = ({ icon, iconBg, title, children, className = "" }) => (
  <div className={`odp-card ${className}`}>
    <div className="odp-card__header">
      <span className="odp-card__icon" style={{ background: iconBg }}>{icon}</span>
      <span className="odp-card__title">{title}</span>
    </div>
    <div className="odp-card__body">{children}</div>
  </div>
);

/**
 * ProductPreviewCard
 * Inline layout: [img]  Product Name — ₹Price   [›]
 * Matches the screenshot: name and price on the same line separated by " — "
 */
const ProductPreviewCard = ({ items, placeholder }) => {
  const firstItem = items?.[0];
  if (!firstItem) return null;

  const productPath = firstItem.productId
    ? buildPath(PATHS.PRODUCT_DETAIL, firstItem.productId)
    : null;

  const extraCount = (items?.length ?? 0) - 1;

  const displayName  = firstItem.productName || firstItem.name || "Product";
  const displayPrice = firstItem.unitPrice ?? firstItem.price ?? 0;
  const displayImage = firstItem.imageUrl || placeholder;

  const inner = (
    <>
      <img
        className="odp-preview-card__img"
        src={displayImage}
        alt={displayName}
        width={72}
        height={72}
        loading="lazy"
        onError={(e) => { e.currentTarget.src = placeholder; }}
      />
      <span className="odp-preview-card__inline">
        <span className="odp-preview-card__name">{displayName}</span>
        {extraCount > 0 && (
          <span className="odp-preview-card__extra"> +{extraCount} more</span>
        )}
        <span className="odp-preview-card__sep"> — </span>
        <span className="odp-preview-card__price">{formatCurrency(displayPrice)}</span>
      </span>
      {productPath && (
        <span className="odp-preview-card__arrow" aria-hidden="true">›</span>
      )}
    </>
  );

  if (productPath) {
    return (
      <Link to={productPath} className="odp-preview-card" aria-label={`View product: ${displayName}`}>
        {inner}
      </Link>
    );
  }

  return <div className="odp-preview-card odp-preview-card--no-link">{inner}</div>;
};

const OrderDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const { order, loading, error } = useOrder(id);
  const { returnStatus, requestReturn } = useReturn(id);
  const { cancelOrder: cancelOrderAction, loading: cancelling, error: cancelError } = useCancelOrder();

  const [cancelled,         setCancelled]         = useState(false);
  const [localReturnStatus, setLocalReturnStatus] = useState(null);
  const [returnModalOpen,   setReturnModalOpen]   = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [returnSuccess,     setReturnSuccess]     = useState(false);
  const [returnError,       setReturnError]       = useState(null);
  const [returnLoading,     setReturnLoading]     = useState(false);
  const [previewImgSrc,     setPreviewImgSrc]     = useState(ORDER_IMAGE_PLACEHOLDER);

  useEffect(() => { if (returnStatus) setLocalReturnStatus(returnStatus); }, [returnStatus]);
  useEffect(() => {
    if (order && RETURN_STATUSES.has(order.status?.toUpperCase()))
      setLocalReturnStatus(order.status.toUpperCase());
  }, [order]);
  useEffect(() => {
    const url = order?.items?.[0]?.imageUrl;
    if (url) setPreviewImgSrc(url);
  }, [order]);

  const handleCancel = async () => {
    try {
      await cancelOrderAction(id);
      showToast({
        type: 'success',
        title: 'Order Cancelled',
        message: '',
      });
      setCancelConfirmOpen(false);
      setCancelled(true);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Cancellation Failed',
        message:
          err?.response?.data?.message ||
          err?.message ||
          'Unable to cancel order.',
      });
    }
  };

  const handleReturnRequest = async () => {
    setReturnLoading(true); setReturnError(null);
    setLocalReturnStatus("RETURN_REQUESTED"); setReturnModalOpen(false);
    try {
      await requestReturn();
      setReturnSuccess(true);
      setTimeout(() => setReturnSuccess(false), 5000);
    } catch (err) {
      setLocalReturnStatus(null);
      setReturnError(err.message || "Failed to initiate return. Please try again.");
    } finally { setReturnLoading(false); }
  };

  if (loading) return (
    <div className="orders-page">
      <button className="orders-back" onClick={() => navigate(PATHS.ORDERS)}>← Back to Orders</button>
      <div className="order-detail-skeleton">
        <div className="skeleton skeleton-heading" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" style={{ width: "60%" }} />
      </div>
    </div>
  );
  if (error) return (
    <div className="orders-page">
      <button className="orders-back" onClick={() => navigate(PATHS.ORDERS)}>← Back to Orders</button>
      <p className="error-text">{error}</p>
    </div>
  );
  if (!order) return (
    <div className="orders-page">
      <button className="orders-back" onClick={() => navigate(PATHS.ORDERS)}>← Back to Orders</button>
      <div className="orders-empty"><h2>Order not found</h2></div>
    </div>
  );

  const currentStatus = cancelled ? "CANCELLED" : order.status;
  const upperStatus   = currentStatus?.toUpperCase() ?? "PENDING";

  const cancelDisabled = !CANCELLABLE.has(upperStatus) || cancelled || cancelling;
  const returnDisabled = !RETURNABLE.has(upperStatus) || cancelled || !!localReturnStatus || returnLoading;
  const isReturnFlow   = !!localReturnStatus;

  const shortId    = order.id?.slice(-8).toUpperCase() || "UNKNOWN";
  const date       = formatDate(order.createdAt) ?? "N/A";
  const itemCount  = (order.items ?? []).reduce((n, i) => n + (i.quantity ?? 1), 0);

  const returnBtnLabel = returnLoading ? "Processing…"
    : localReturnStatus ? "Return Requested" : "↩ Return Order";

  const returnRequestedOn = formatDate(order.returnRequestedAt);
  const returnCompletedOn = formatDate(order.returnCompletedAt);

  const rawRefundStatus = order.refundStatus?.toUpperCase();
  const displayRefund   = rawRefundStatus
    ? (REFUND_STATUS_LABELS[rawRefundStatus] ?? order.refundStatus)
    : isReturnFlow ? "Pending" : null;

  const showCancel = CANCELLABLE.has(upperStatus) && !cancelled;
  const showReturn = RETURNABLE.has(upperStatus) && !cancelled && !isReturnFlow;

  return (
    <div className="orders-page order-detail-page">

      <button className="orders-back" onClick={() => navigate(PATHS.ORDERS)} aria-label="Back to Orders">
        ← Back to Orders
      </button>

      <div className="order-detail__header">
        <div>
          <h1 className="order-detail__title">Order Details</h1>
          <p className="order-detail__order-number">Order #{shortId}</p>
          <p className="order-detail__date">Placed on {date}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <OrderStatusBadge status={currentStatus} />
          {isReturnFlow && returnRequestedOn && (
            <p className="order-detail__return-meta">Requested on {returnRequestedOn}</p>
          )}
        </div>
      </div>

      {/* ── Product Preview Card ── */}
      <ProductPreviewCard items={order.items} placeholder={ORDER_IMAGE_PLACEHOLDER} />

      {/* ── Timeline ── */}
      <div className="order-detail__timeline">
        <OrderTimeline status={localReturnStatus || currentStatus} isReturnFlow={isReturnFlow} />
      </div>

      <div className="odp-grid">
        <div className="odp-left">

          <SectionCard icon="📍" iconBg="rgba(59,130,246,0.15)" title="Shipping Address" className="odp-card--address">
            <ShippingInfo address={order.address} />
          </SectionCard>

          <SectionCard icon="🛍️" iconBg="rgba(168,85,247,0.15)" title="Products Ordered">
            <div className="odp-items-wrapper">
              <OrderItemsList items={order.items} />
            </div>
          </SectionCard>

          <SectionCard icon="ℹ️" iconBg="rgba(59,130,246,0.15)" title="Order Information">
            <div className="odp-info-cols">
              <div className="odp-info-col">
                <span className="odp-info-col__label">Status</span>
                <span className="odp-info-col__value">
                  <OrderStatusBadge status={currentStatus} />
                </span>
              </div>
              <div className="odp-info-divider" />
              <div className="odp-info-col">
                <span className="odp-info-col__label">Items</span>
                <span className="odp-info-col__value odp-info-col__value--plain">{itemCount}</span>
              </div>
              <div className="odp-info-divider" />
              <div className="odp-info-col">
                <span className="odp-info-col__label">Order Date</span>
                <span className="odp-info-col__value odp-info-col__value--plain">
                  <span style={{ marginRight: 4 }}>📅</span>{date}
                </span>
              </div>
            </div>
          </SectionCard>

          {isReturnFlow && (
            <SectionCard icon="↩" iconBg="rgba(245,158,11,0.15)" title="Return Information">
              <div className="order-info-grid">
                <div className="order-info-row">
                  <span className="order-info-label">Return Status</span>
                  <span className="order-info-value" style={{ color: "var(--color-warning,#f97316)", fontWeight: 600 }}>
                    {STATUS_LABELS[localReturnStatus] ?? localReturnStatus}
                  </span>
                </div>
                {returnRequestedOn && (
                  <div className="order-info-row">
                    <span className="order-info-label">Return Requested On</span>
                    <span className="order-info-value">{returnRequestedOn}</span>
                  </div>
                )}
                {returnCompletedOn && (
                  <div className="order-info-row">
                    <span className="order-info-label">Return Completed On</span>
                    <span className="order-info-value">{returnCompletedOn}</span>
                  </div>
                )}
                {displayRefund && (
                  <div className="order-info-row">
                    <span className="order-info-label">Refund Status</span>
                    <span className="order-info-value" style={{
                      color: displayRefund === "Processed" || displayRefund === "Approved"
                        ? "var(--color-success,#22c55e)" : "var(--color-warning,#f97316)",
                      fontWeight: 600,
                    }}>{displayRefund}</span>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {cancelError  && <p className="error-text" style={{ marginTop: 8 }}>{cancelError}</p>}
          {returnError  && <p className="error-text" style={{ marginTop: 8 }}>{returnError}</p>}
          {returnSuccess && <p className="success-text" style={{ marginTop: 8 }}>Return request submitted successfully.</p>}

          {(showCancel || showReturn) && (
            <div className="odp-card odp-actions-card">
              <div className="odp-actions-row">
                {showCancel && (
                  <button
                    className="odp-btn odp-btn--cancel"
                    onClick={() => setCancelConfirmOpen(true)}
                    disabled={cancelDisabled}
                  >
                    <span>🗑</span> {cancelling ? "Cancelling…" : "Cancel Order"}
                  </button>
                )}
                {showReturn && (
                  <button className="odp-btn odp-btn--return" onClick={() => setReturnModalOpen(true)} disabled={returnDisabled}>
                    {returnBtnLabel}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="odp-right">
          <div className="odp-pricing-panel">
            <div className="odp-pricing-panel__header">
              <span className="odp-pricing-panel__icon">🏷️</span>
              <span className="odp-pricing-panel__title">Pricing Summary</span>
            </div>
            <OrderPricingSummary order={order} />
          </div>
        </div>
      </div>

      <ReturnModal
        open={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onConfirm={handleReturnRequest}
        loading={returnLoading}
      />

      {cancelConfirmOpen && (
        <div
          className="odp-confirm-overlay"
          role="presentation"
          onClick={() => !cancelling && setCancelConfirmOpen(false)}
        >
          <div
            className="odp-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
            aria-describedby="cancel-order-description"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="odp-confirm-dialog__icon" aria-hidden="true">🗑</div>
            <div className="odp-confirm-dialog__content">
              <p className="odp-confirm-dialog__eyebrow">Cancel order</p>
              <h2 id="cancel-order-title" className="odp-confirm-dialog__title">
                Are you sure you want to cancel this order?
              </h2>
              <p id="cancel-order-description" className="odp-confirm-dialog__description">
                This action will stop processing for this order and cannot be easily undone.
              </p>
            </div>
            <div className="odp-confirm-dialog__actions">
              <button
                type="button"
                className="odp-btn odp-btn--ghost"
                onClick={() => setCancelConfirmOpen(false)}
                disabled={cancelling}
              >
                Keep Order
              </button>
              <button
                type="button"
                className="odp-btn odp-btn--danger"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;
