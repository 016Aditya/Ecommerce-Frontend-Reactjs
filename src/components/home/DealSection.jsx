import { Link } from "react-router-dom";
import PATHS from "@/routes/paths";

const productPath = (category, subcategory) => {
  const params = new URLSearchParams({ category });
  if (subcategory) params.set("subcategory", subcategory);
  return `${PATHS.PRODUCTS}?${params.toString()}`;
};

const DEALS = [
  {
    title: "Top Electronics",
    subtitle: "Up to 60% off",
    link: productPath("Electronics"),
    items: [
      { label: "Mobiles",   emoji: "📱", link: productPath("Electronics", "Mobile") },
      { label: "Laptops",   emoji: "💻", link: productPath("Electronics", "Laptop") },
      { label: "Earphones", emoji: "🎧", link: productPath("Electronics", "Headphones") },
      { label: "Cameras",   emoji: "📷", link: productPath("Electronics", "Camera") },
    ],
  },
  {
    title: "Fashion Deals",
    subtitle: "Min. 40% off",
    link: productPath("Clothing"),
    items: [
      { label: "Men's Wear",  emoji: "👔", link: productPath("Clothing", "Shirt") },
      { label: "Women's",     emoji: "👗", link: productPath("Clothing", "Dress") },
      { label: "Footwear",    emoji: "👟", link: productPath("Clothing", "Shoes") },
      { label: "Accessories", emoji: "👜", link: productPath("Clothing") },
    ],
  },
  {
    title: "Home & Kitchen",
    subtitle: "Starting ₹199",
    link: productPath("Home"),
    items: [
      { label: "Furniture", emoji: "🛋️", link: productPath("Home", "Furniture") },
      { label: "Kitchen",   emoji: "🍳", link: productPath("Home", "Kitchen") },
      { label: "Decor",     emoji: "🪴", link: productPath("Home", "Decor") },
      { label: "Bedding",   emoji: "🛏️", link: productPath("Home") },
    ],
  },
  {
    title: "Books & Sports",
    subtitle: "Deals from ₹99",
    link: productPath("Books"),
    items: [
      { label: "Bestsellers", emoji: "📚", link: productPath("Books", "Novel") },
      { label: "Sports Gear", emoji: "⚽",    link: productPath("Sports") },
      { label: "Fitness",     emoji: "🏋️", link: productPath("Sports", "Gym") },
      { label: "Outdoor",     emoji: "🏕️", link: productPath("Sports") },
    ],
  },
];

function DealSection() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "calc(100% - 48px)",
        marginInline: "auto",
        paddingBlock: "1.5rem",
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DEALS.map((deal) => (
          <div
            key={deal.title}
            className="flex flex-col"
            style={{
              backgroundColor: "var(--card-bg)",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              border: "1px solid transparent",
              transition: "border-color 200ms ease, transform 200ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Card header */}
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <h2
                  className="font-bold"
                  style={{ color: "var(--text-primary)", fontSize: "18px", fontWeight: 700 }}
                >
                  {deal.title}
                </h2>
                <p style={{ color: "#2874f0", fontSize: "13px", fontWeight: 500, marginTop: "2px" }}>
                  {deal.subtitle}
                </p>
              </div>
              <Link
                to={deal.link}
                className="hover:underline"
                style={{ color: "#2874f0", fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap" }}
              >
                See more
              </Link>
            </div>

            {/* 4-item single horizontal row — no cell backgrounds */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "4px",
              }}
            >
              {deal.items.map((item) => (
                <Link
                  key={item.label}
                  to={item.link}
                  className="hover:opacity-80 transition"
                  style={{
                    display:        "flex",
                    flexDirection:  "column",
                    alignItems:     "center",
                    justifyContent: "center",
                    gap:            "8px",
                    padding:        "12px 4px",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontSize: "2.6rem", lineHeight: 1, display: "block" }}>
                    {item.emoji}
                  </span>
                  <span
                    style={{
                      fontSize:   "15px",
                      fontWeight: 500,
                      color:      "var(--text-primary)",
                      textAlign:  "center",
                      lineHeight: 1.3,
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DealSection;
