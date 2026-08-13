/**
 * SimilarProducts.jsx — Phase 2A
 *
 * What changed:
 *   Replaced the manual useState + useEffect + getProductsByCategory call
 *   with useProductsByCategoryQuery from TanStack Query.
 *
 *   This means:
 *     - If the user is on a product detail page and the category has already
 *       been loaded (e.g. from ProductsPage browsing), SimilarProducts gets
 *       its data from cache instantly — zero network request.
 *     - The shared cache key ['products', 'list', 'category', category] is
 *       exactly the same key used by ProductsPage for category filtering.
 *
 * What stayed the same:
 *   All JSX, CSS, skeleton loader, card rendering, navigation, discount
 *   badge, and the "View All" button are completely unchanged.
 */
import { useNavigate } from 'react-router-dom';
import { useProductsByCategoryQuery } from '@/hooks/useQueryProducts';
import PATHS from '@/routes/paths';
import '../styles/SimilarProducts.css';

const SimilarProducts = ({ category, currentProductId }) => {
  const navigate = useNavigate();

  const { data: allInCategory = [], isLoading: loading } =
    useProductsByCategoryQuery(category);

  // Filter out the current product and cap at 12 items
  const products = allInCategory
    .filter((p) => p.id !== currentProductId)
    .slice(0, 12);

  if (!loading && products.length === 0) return null;

  const formatPrice = (p) =>
    new Intl.NumberFormat('en-IN', {
      style:                 'currency',
      currency:              'INR',
      maximumFractionDigits: 0,
    }).format(p);

  const discountPct = (original, current) =>
    original > current ? Math.round(((original - current) / original) * 100) : null;

  return (
    <section className="similar-products" aria-label="Similar Products">
      <div className="similar-products__header">
        <h2 className="similar-products__title">Similar Products</h2>
        <button
          className="similar-products__view-all"
          onClick={() =>
            navigate(`${PATHS.PRODUCTS}?category=${encodeURIComponent(category)}`)
          }
        >
          View All →
        </button>
      </div>

      <div className="similar-products__track">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="sim-card sim-card--skeleton">
                <div className="sim-card__img skeleton" style={{ height: 76 }} />
                <div className="sim-card__body">
                  <div className="skeleton" style={{ height: 13, width: '85%', borderRadius: 4, marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 13, width: '50%', borderRadius: 4, marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 13, width: '60%', borderRadius: 4 }} />
                </div>
              </div>
            ))
          : products.map((p) => {
              const off = discountPct(p.originalPrice, p.price);
              return (
                <button
                  key={p.id}
                  className="sim-card"
                  onClick={() => navigate(`${PATHS.PRODUCTS}/${p.id}`)}
                  aria-label={p.name}
                >
                  {off && <span className="sim-card__badge">{off}% OFF</span>}
                  <div className="sim-card__img-wrap">
                    <img
                      src={
                        p.imageUrl ||
                        'https://via.placeholder.com/200x200?text=No+Image'
                      }
                      alt={p.name}
                      className="sim-card__img"
                      loading="lazy"
                    />
                  </div>
                  <div className="sim-card__body">
                    {p.rating && (
                      <span className="sim-card__rating">
                        ★ {Number(p.rating).toFixed(1)}
                      </span>
                    )}
                    <p className="sim-card__name">{p.name}</p>
                    <p className="sim-card__price">{formatPrice(p.price)}</p>
                    {p.originalPrice > p.price && (
                      <p className="sim-card__original">{formatPrice(p.originalPrice)}</p>
                    )}
                  </div>
                </button>
              );
            })}
      </div>
    </section>
  );
};

export default SimilarProducts;
