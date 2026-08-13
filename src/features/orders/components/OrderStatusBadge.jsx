// src/features/orders/components/OrderStatusBadge.jsx

/**
 * OrderStatusBadge
 *
 * Fix: added all 6 return statuses that were missing.
 * Return statuses in-progress → amber; terminal success → green.
 *
 * Existing delivery statuses are UNTOUCHED.
 */

const AMBER_LIGHT = { color: "#92400e", bg: "#fef3c7" };
const AMBER_DARK  = { color: "#fcd34d", bg: "#451a03" }; // used via CSS variable
const GREEN_LIGHT = { color: "#166534", bg: "#dcfce7" };

// All status definitions — light mode colours.
// Dark mode overrides are handled by the .order-status-badge--dark-* classes
// injected via the <style> block below.
const STATUS_MAP = {
  // ── Delivery (existing — DO NOT RENAME) ─────────────────────────────
  PENDING:   { label: "Pending",   color: "#b45309", bg: "#fef3c7" },
  CONFIRMED: { label: "Confirmed", color: "#1d4ed8", bg: "#dbeafe" },
  PACKED:    { label: "Packed",    color: "#7c3aed", bg: "#ede9fe" },
  SHIPPED:   { label: "Shipped",   color: "#0369a1", bg: "#e0f2fe" },
  DELIVERED: { label: "Delivered", color: "#15803d", bg: "#dcfce7" },
  CANCELLED: { label: "Cancelled", color: "#b91c1c", bg: "#fee2e2" },

  // ── Return in-progress (amber) — NEW ────────────────────────────────
  RETURN_REQUESTED: { label: "Return Requested", ...AMBER_LIGHT },
  RETURN_APPROVED:  { label: "Return Approved",  ...AMBER_LIGHT },
  PICKUP_SCHEDULED: { label: "Pickup Scheduled", ...AMBER_LIGHT },
  PICKED_UP:        { label: "Picked Up",         ...AMBER_LIGHT },

  // ── Return terminal success (green) — NEW ───────────────────────────
  REFUND_PROCESSED:  { label: "Refund Processed",  ...GREEN_LIGHT },
  RETURN_SUCCESSFUL: { label: "Return Successful", ...GREEN_LIGHT },

  // ── Legacy alias (keep for old data compatibility) ───────────────────
  RETURNED: { label: "Returned", ...GREEN_LIGHT },
};

// Which statuses are "return in-progress" (amber) for dark mode
const RETURN_AMBER_STATUSES = new Set([
  "RETURN_REQUESTED",
  "RETURN_APPROVED",
  "PICKUP_SCHEDULED",
  "PICKED_UP",
]);

// Which statuses are "return success" (green) for dark mode
const RETURN_GREEN_STATUSES = new Set([
  "REFUND_PROCESSED",
  "RETURN_SUCCESSFUL",
  "RETURNED",
]);

// Soft, theme-aware tinted chips (uses the semantic success/info/error
// tokens so the badge reads correctly in both light and dark mode).
const TINTED_CLASS = {
  DELIVERED: "order-status-badge--delivered",
  SHIPPED:   "order-status-badge--shipped",
  CANCELLED: "order-status-badge--cancelled",
};

const OrderStatusBadge = ({ status }) => {
  const key = (status ?? "").toUpperCase();
  const s   = STATUS_MAP[key] ?? {
    label: status ?? "Unknown",
    color: "var(--text-secondary, #6b7280)",
    bg:    "var(--bg-secondary, #f3f4f6)",
  };

  const tintedClass = TINTED_CLASS[key];

  // Dark-mode modifier class for the two return groups
  const darkClass = RETURN_AMBER_STATUSES.has(key)
    ? "order-status-badge--return-amber"
    : RETURN_GREEN_STATUSES.has(key)
    ? "order-status-badge--return-green"
    : "";

  const modifierClass = tintedClass || darkClass;

  return (
    <span
      className={["order-status-badge", modifierClass].filter(Boolean).join(" ")}
      style={tintedClass ? undefined : { color: s.color, background: s.bg }}
    >
      {s.label}
    </span>
  );
};

export default OrderStatusBadge;

/*
  Append these rules to Orders.css (or keep here via a <style> injection).
  They override the inline light-mode colours in dark mode without
  requiring CSS variables on every inline style.

  .order-status-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
  }

  [data-theme="dark"] .order-status-badge--return-amber {
    background: #451a03 !important;
    color: #fcd34d !important;
  }

  [data-theme="dark"] .order-status-badge--return-green {
    background: #14532d !important;
    color: #86efac !important;
  }
*/
