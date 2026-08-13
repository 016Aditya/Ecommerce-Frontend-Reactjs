const CATEGORY_MAP = {
  All: [],
  Electronics: ["All Electronics", "Mobile", "Laptop", "TV", "Tablet", "Camera", "Headphones", "Gadgets"],
  Clothing: ["All Clothing", "Shirt", "Jeans", "Dress", "Shoes", "Jacket", "Kurta"],
  Books: ["All Books", "Textbook", "Novel", "Stationery", "Comics"],
  Home: ["All Home", "Furniture", "Appliances", "Decor", "Kitchen"],
  Sports: ["All Sports", "Cricket", "Football", "Gym", "Yoga"],
};

const TOP_CATEGORIES = Object.keys(CATEGORY_MAP);

const ProductFilter = ({ activeCategory, activeSubcategory, onSelect, onSubSelect }) => {
  const subs = CATEGORY_MAP[activeCategory] ?? [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category" style={{ marginTop: '6px' }}>
        {TOP_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            aria-pressed={activeCategory === cat}
            className="rounded-full transition"
            style={{
              backgroundColor: activeCategory === cat ? "var(--info-text)" : "var(--bg-secondary)",
              color: activeCategory === cat ? "#ffffff" : "var(--text-secondary)",
              border: `1px solid ${activeCategory === cat ? "var(--info-text)" : "var(--border-color)"}`,
              fontSize: '15px',
              fontWeight: activeCategory === cat ? 700 : 500,
              paddingBlock: '7px',
              paddingInline: '20px',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeCategory !== "All" && subs.length > 0 && (
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by subcategory">
          {subs.map((sub) => {
            const key = sub.startsWith("All ") ? null : sub;
            const isActive = sub.startsWith("All ") ? !activeSubcategory : activeSubcategory === key;

            return (
              <button
                key={sub}
                onClick={() => onSubSelect?.(key)}
                aria-pressed={isActive}
                className="rounded-full font-medium transition"
                style={{
                  backgroundColor: isActive ? "var(--info-bg)" : "var(--card-bg)",
                  color: isActive ? "var(--info-text)" : "var(--text-secondary)",
                  border: `1px solid ${isActive ? "var(--info-border)" : "var(--border-color)"}`,
                  fontSize: '12px',
                  paddingBlock: '6px',
                  paddingInline: '15px',
                }}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductFilter;
