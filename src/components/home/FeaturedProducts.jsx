import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeaturedProducts } from '@/features/products/hooks/useFeaturedProducts';
import { formatCurrencyTrimmed } from '@/utils/currency';
import RatingBadge from '@/components/common/RatingBadge';
import PATHS, { buildPath } from '@/routes/paths';

function SkeletonCard() {
  return (
    <div
      className="flex h-full w-full min-w-0 flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      }}
    >
      <div
        className="animate-pulse w-full"
        style={{
          aspectRatio: '1 / 1',
          margin: '7px',
          width: 'calc(100% - 14px)',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--featured-image-start) 0%, var(--featured-image-end) 100%)',
        }}
      />
      <div className="flex flex-col gap-1.5 px-3 pb-3 pt-1">
        <div className="h-2 w-1/3 animate-pulse rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        <div className="h-3 w-3/4 animate-pulse rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        <div className="h-3 w-1/2 animate-pulse rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        <div className="h-3.5 w-1/3 animate-pulse rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        <div className="h-9 w-full animate-pulse rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
      </div>
    </div>
  );
}

// Stage 1: memoised so parent re-renders don't re-render every card in the grid
const FeaturedCard = memo(function FeaturedCard({ product }) {
  const navigate = useNavigate();
  const openProduct = () => navigate(buildPath(PATHS.PRODUCT_DETAIL, product.id));

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <article
      className="group flex h-full w-full min-w-0 cursor-pointer flex-col overflow-hidden transition-all duration-[220ms]"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
      }}
      onClick={openProduct}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openProduct()}
    >
      {/* Image */}
      <div
        className="relative flex w-full items-center justify-center overflow-hidden"
        style={{
          aspectRatio: '1 / 1',
          margin: '7px',
          width: 'calc(100% - 14px)',
          borderRadius: '8px',
          padding: '8px',
          background: 'linear-gradient(135deg, var(--featured-image-start) 0%, var(--featured-image-end) 100%)',
        }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            width={240}
            height={240}
            decoding="async"
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transition: 'transform 220ms ease',
            }}
            className="group-hover:scale-[1.04]"
          />
        ) : (
          <span className="text-4xl" aria-hidden="true">🛒</span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 px-3 pb-3 pt-1.5">
        <p
          className="featured-card__name line-clamp-2 text-sm font-semibold leading-snug"
          style={{
            color: 'var(--text-primary)',
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            minHeight: '2.4em',
          }}
        >
          {product.name}
        </p>

        <div className="mt-0.5">
          <RatingBadge
            rating={product.averageRating || 0}
            count={product.totalRatings || 0}
          />
        </div>

        <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
          <span style={{ fontSize: '16.8px', fontWeight: 800, color: '#22c55e' }}>
            {formatCurrencyTrimmed(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price ? (
            <span className="text-xs line-through" style={{ color: 'var(--text-tertiary)' }}>
              {formatCurrencyTrimmed(product.originalPrice)}
            </span>
          ) : null}
          {discount ? (
            <span className="text-xs font-semibold" style={{ color: 'var(--color-error, #e53e3e)' }}>
              {discount}% off
            </span>
          ) : null}
        </div>

        <p className="text-xs font-semibold text-green-500">✓ Free Delivery</p>

        {(product.category || product.subcategory) ? (
          <div className="flex flex-wrap items-center gap-1">
            {product.category ? (
              <span
                className="w-fit rounded-full px-2 py-0.5"
                style={{ fontSize: '10px', color: 'var(--text-secondary)', backgroundColor: 'var(--badge-bg)' }}
              >
                {product.category}
              </span>
            ) : null}
            {product.subcategory ? (
              <span
                className="w-fit rounded-full px-2 py-0.5"
                style={{ fontSize: '10px', color: 'var(--text-secondary)', backgroundColor: 'var(--badge-bg)' }}
              >
                {product.subcategory}
              </span>
            ) : null}
          </div>
        ) : null}

        <button
          className="mt-auto w-full rounded-md text-xs font-bold transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'var(--button-primary)',
            color: 'var(--button-primary-text)',
            minHeight: '40px',
            paddingBlock: '8px',
          }}
          onClick={(e) => {
            e.stopPropagation();
            openProduct();
          }}
          aria-label={`View ${product.name}`}
        >
          View Details
        </button>
      </div>
    </article>
  );
});

function FeaturedProducts() {
  const { products, loading, error } = useFeaturedProducts();
  const navigate = useNavigate();

  const gridClass =
    'grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  return (
    <section
      className="featured-section container-app"
      style={{ paddingTop: '21px', paddingBottom: '21px' }}
    >
      <div
        className="featured-shell overflow-hidden"
        style={{
          padding: '15px 16px',
          background: 'linear-gradient(180deg, var(--featured-shell-start) 0%, var(--featured-shell-end) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex items-center justify-between gap-4" style={{ marginBottom: '13px' }}>
          <div>
            <h2
              className="text-lg font-bold sm:text-xl"
              style={{ color: 'var(--text-primary)', lineHeight: 1.3 }}
            >
              Featured Products
            </h2>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              Discover our most popular and trending products.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '7px',
              padding: '4px 11px',
            }}
            onClick={() => navigate(PATHS.PRODUCTS)}
          >
            Browse All
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {loading ? (
          <div className={gridClass}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div
            className="rounded-xl border px-4 py-6 text-center text-sm"
            style={{
              backgroundColor: 'var(--error-bg)',
              borderColor: 'var(--error-border)',
              color: 'var(--error-text)',
            }}
          >
            <p className="font-semibold">Could not load featured products.</p>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        ) : null}

        {!loading && !error && products.length === 0 ? (
          <div
            className="rounded-xl border px-4 py-6 text-center text-sm"
            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
          >
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Featured products will appear here soon.
            </p>
          </div>
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <div className={gridClass}>
            {products.map((product) => (
              <FeaturedCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default FeaturedProducts;
