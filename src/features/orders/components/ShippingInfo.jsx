import { useState } from "react";

/**
 * ShippingInfo
 *
 * Receives an address already normalised by normalizeOrder.js:
 *   { name, phone, line1, line2, city, state, zipCode, country }
 *
 * UI format mirrors SavedAddressesList exactly:
 *   Row 1 : Name   Phone
 *   Row 2 : line1, city
 *   Link  : Show more / Show less  (accent colour)
 *   Expand: line1
 *            line2
 *            city, state — zipCode
 *            Country  (bold)
 */
const ShippingInfo = ({ address }) => {
  const [expanded, setExpanded] = useState(false);

  if (!address) {
    return (
      <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
        No address on file.
      </p>
    );
  }

  const { name, phone, line1, line2, city, state, zipCode, country } = address;

  const previewLine = [line1, city].filter(Boolean).join(", ");
  const cityStateLine = [
    [city, state].filter(Boolean).join(", "),
    zipCode ? `— ${zipCode}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      {/* Row 1: Name  Phone */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
        {name && (
          <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
            {name}
          </span>
        )}
        {phone && (
          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
            {phone}
          </span>
        )}
      </div>

      {/* Row 2: short preview — line1, city */}
      {previewLine && (
        <p style={{ fontSize: "14px", lineHeight: "17.6px", color: "var(--text-secondary)", margin: 0 }}>
          {previewLine}
        </p>
      )}

      {/* Show more / Show less */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        style={{
          marginTop: "4px",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--accent)",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {expanded ? "Show less" : "Show more"}
      </button>

      {/* Expanded full address */}
      {expanded && (
        <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "2px", fontSize: "14px", lineHeight: "19px", color: "var(--text-secondary)" }}>
          {line1 && <p style={{ margin: 0 }}>{line1}</p>}
          {line2 && <p style={{ margin: 0 }}>{line2}</p>}
          {cityStateLine && <p style={{ margin: 0 }}>{cityStateLine}</p>}
          {country && (
            <p style={{ margin: 0, fontWeight: 700, color: "var(--text-primary)" }}>
              {country}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ShippingInfo;
