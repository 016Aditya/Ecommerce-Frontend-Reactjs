import { useState } from "react";
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
      { label: "Sports Gear", emoji: "⚽", link: productPath("Sports") },
      { label: "Fitness",     emoji: "🏋️", link: productPath("Sports", "Gym") },
      { label: "Outdoor",     emoji: "🏕️", link: productPath("Sports") },
    ],
  },
];

// ── Single deal category item with hover effects ──────────────────────────
function DealItem({ item }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={item.link}
      className="deal-item flex flex-col items-center justify-center rounded-sm p-4 gap-2"
      style={{
        backgroundColor:  hovered ? 'var(--card-bg)'        : 'var(--bg-tertiary)',
        border:           hovered ? '1px solid var(--border-color)' : '1px solid transparent',
        transform:        hovered ? 'translateY(-3px)'      : 'translateY(0)',
        boxShadow:        hovered ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
        transition:       'all 200ms ease-in-out',
        textDecoration:   'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        style={{
          fontSize:   '1.875rem', /* text-3xl */
          display:    'inline-block',
          transform:  hovered ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 200ms ease-in-out',
        }}
      >
        {item.emoji}
      </span>
      <span
        style={{
          fontSize:   '14px',
          fontWeight: 500,
          color:      'var(--text-primary)',
          textAlign:  'center',
          lineHeight: 1.3,
        }}
      >
        {item.label}
      </span>
    </Link>
  );
}

function DealSection() {
  return (
    <div className="container-app py-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DEALS.map((deal) => (
          <div
            key={deal.title}
            className="rounded-sm shadow-sm p-4 flex flex-col"
            style={{ backgroundColor: "var(--card-bg)" }}
          >
            <div className="mb-3 flex items-baseline justify-between">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {deal.title}
                </h2>
                <p className="text-xs font-semibold" style={{ color: "#2874f0" }}>
                  {deal.subtitle}
                </p>
              </div>
              <Link
                to={deal.link}
                className="text-xs font-medium hover:underline"
                style={{ color: "#2874f0" }}
              >
                See more
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1">
              {deal.items.map((item) => (
                <DealItem key={item.label} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DealSection;
