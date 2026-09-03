import { Link } from 'react-router-dom';
import ProductCard from '@/features/products/components/ProductCard';

function SkeletonCard() {
  return (
    <div
      className="flex h-full w-full min-w-0 flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      }}
    >
      <div
        className="animate-pulse w-full"
        style={{
          aspectRatio: '1 / 1',
          margin: '7px',
          width: 'calc(100% - 14px)',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--featured-image-start) 0%, var(--featured-image-end) 100%)',
        }}
      />
      <div className="flex flex-col gap-1.5 px-3.5 pb-3.5 pt-1">
        <div className="h-2 w-1/3 animate-pulse rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        <div className="h-3 w-3/4 animate-pulse rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        <div className="h-3 w-1/2 animate-pulse rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        <div className="h-9 w-full animate-pulse rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
      </div>
    </div>
  );
}

/**
 * Shared desktop merchandising rail — used by TodaysDeals and TopRated.
 * Same gradient shell / header / grid chrome as FeaturedProducts, but
 * renders the real ProductCard (Add to Cart + wishlist) instead of the
 * simplified homepage-only card.
 */
function ProductRail({ title, subtitle, products, loading, error, browseAllPath, emptyMessage }) {
  const gridClass = 'grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  return (
    <section
      style={{
        paddingTop: '21px',
        paddingBottom: '21px',
        width: '100%',
        maxWidth: 'calc(100% - 48px)',
        marginInline: 'auto',
      }}
    >
      <div
        className="overflow-hidden"
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
            <h2 style={{ color: 'var(--text-primary)', lineHeight: 1.3, fontSize: '22px', fontWeight: 700 }}>
              {title}
            </h2>
            <p className="mt-1.5" style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
              {subtitle}
            </p>
          </div>
          {browseAllPath ? (
            <Link
              to={browseAllPath}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '7px',
                padding: '4px 11px',
                textDecoration: 'none',
              }}
            >
              Browse All
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div className={gridClass}>
            {Array.from({ length: 5 }).map((_, i) => (
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
            <p className="font-semibold">Could not load {title.toLowerCase()}.</p>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        ) : null}

        {!loading && !error && products.length === 0 ? (
          <div
            className="rounded-xl border px-4 py-6 text-center text-sm"
            style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}
          >
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {emptyMessage}
            </p>
          </div>
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <div className={gridClass}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default ProductRail;
