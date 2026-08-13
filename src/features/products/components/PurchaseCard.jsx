import { formatCurrencyTrimmed } from "@/utils/currency";

const SpinnerLabel = ({ label }) => (
  <span className="flex items-center justify-center gap-2">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.7s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
    {label}
  </span>
);

const PurchaseCard = ({
  product,
  onAddToCart,
  onRemoveFromCart,
  onBuyNow,
  addingToCart = false,
  removingFromCart = false,
  buyingNow = false,
  isInCart = false,
}) => {
  const outOfStock = product.inStock === false;
  const cartBtnDisabled = outOfStock || addingToCart || removingFromCart || buyingNow;

  const cartBtnStyle = () => {
    if (outOfStock) return { background: "var(--bg-tertiary)", color: "var(--text-tertiary)" };
    if (addingToCart) return { background: "#86efac", color: "#fff" };
    if (removingFromCart) return { background: "#fca5a5", color: "#fff" };
    if (isInCart) return { background: "#ef4444", color: "#fff" };
    return { background: "var(--accent, #ff9f00)", color: "#fff" };
  };

  const cartBtnLabel = () => {
    if (outOfStock) return "OUT OF STOCK";
    if (addingToCart) return <SpinnerLabel label="Adding..." />;
    if (removingFromCart) return <SpinnerLabel label="Removing..." />;
    if (isInCart) return "REMOVE FROM CART";
    return "ADD TO CART";
  };

  return (
    <div
      className="purchase-card rounded-lg px-4"
      style={{
        border: "1px solid color-mix(in srgb, var(--border-color) 94%, white 6%)",
        background: "var(--card-bg)",
        boxShadow: "var(--shadow-sm)",
        position: "sticky",
        top: 80,
        padding: "16px",
        transition: "border-color 200ms ease, box-shadow 200ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--border-color) 94%, white 6%)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      <div className="mb-1">
        <span className="font-bold" style={{ fontSize: "30px", color: "var(--text-primary)" }}>
          {formatCurrencyTrimmed(Number(product.price))}
        </span>

        {product.originalPrice > product.price && (
          <>
            <span className="ml-2 text-sm line-through" style={{ color: "var(--text-tertiary)" }}>
              {formatCurrencyTrimmed(product.originalPrice)}
            </span>
            <span className="ml-2 text-sm font-semibold text-green-500">
              {Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) * 100
              )}% off
            </span>
          </>
        )}
      </div>

      <p className="mb-1 font-semibold text-green-500" style={{ fontSize: "14px" }}>Free Delivery</p>
      {outOfStock ? (
        <p className="mb-3 text-sm font-semibold text-red-500">Out of Stock</p>
      ) : (
        <p className="mb-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          In Stock - ships within 2 days
        </p>
      )}

      <button
        className="mb-2 flex w-full min-h-11 items-center justify-center rounded-xl text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.985]"
        style={{
          ...cartBtnStyle(),
          transition: "all 180ms ease",
        }}
        onMouseEnter={(e) => { if (!cartBtnDisabled) e.currentTarget.style.filter = "brightness(1.04)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
        onClick={isInCart ? onRemoveFromCart : onAddToCart}
        disabled={cartBtnDisabled}
        aria-label={isInCart ? "Remove from cart" : "Add to cart"}
      >
        {cartBtnLabel()}
      </button>

      <button
        className="flex w-full min-h-11 items-center justify-center rounded-xl text-sm font-bold active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70"
        style={{
          background: outOfStock ? "var(--bg-tertiary)" : "#fb8c00",
          color: outOfStock ? "var(--text-tertiary)" : "#fff",
          transition: "all 180ms ease",
        }}
        onMouseEnter={(e) => { if (!outOfStock && !addingToCart && !removingFromCart && !buyingNow) e.currentTarget.style.filter = "brightness(1.04)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = "brightness(1)"; }}
        onClick={onBuyNow}
        disabled={outOfStock || addingToCart || removingFromCart || buyingNow}
        aria-label="Buy now"
      >
        {buyingNow ? (
          <SpinnerLabel label="Processing..." />
        ) : outOfStock ? "UNAVAILABLE" : "BUY NOW"}
      </button>

      {/* ── Secure Checkout ── minimal trust row, integrated with the card */}
      <div
        className="flex items-center gap-3"
        style={{
          paddingTop: "18px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Orange lock icon — small subtle container, no glow/shadow */}
        <span
          aria-hidden="true"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            flexShrink: 0,
            background: "color-mix(in srgb, var(--card-bg) 88%, white 12%)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="#fb8c00"
            aria-hidden="true"
          >
            <path d="M12 1C9.24 1 7 3.24 7 6v2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
          </svg>
        </span>

        {/* Two-line text block */}
        <div style={{ lineHeight: 1.35, minWidth: 0 }}>
          <p
            className="text-sm font-bold"
            style={{ color: "var(--text-primary)", marginBottom: "2px" }}
          >
            Secure checkout
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            Your payment information is safe with us.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PurchaseCard;
