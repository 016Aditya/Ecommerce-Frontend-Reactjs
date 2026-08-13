import ProductCard from "./ProductCard";

const ProductGrid = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-sm py-24 text-center shadow-sm"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
        }}
      >
        <span className="mb-4 text-6xl">🔍</span>
        <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          No products found
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
          Try a different search or category
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
