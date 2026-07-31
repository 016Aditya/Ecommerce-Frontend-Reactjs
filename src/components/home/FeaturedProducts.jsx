import { memo, useRef, useState, useEffect, useCallback } from 'react';
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

// ── Carousel arrow button ─────────────────────────────────────────────────
function ArrowButton({ direction, onClick, hidden }) {
  if (hidden) return null;
  return (
    <button
      onClick={onClick}
      aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
      className="carousel-arrow absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center rounded-full"
      style={{
        [direction === 'left' ? 'left' : 'right']: '-18px',
        width: '40px',
        height: '40px',
        backgroundColor: 'rgba(255,255,255,0.12)',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
    >
      <svg
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="var(--text-primary)" strokeWidth="2.2"
        strokeLinecap="round" strokeLinejoin="round"
      >
        {direction === 'left'
          ? <path d="M15.75 19.5 8.25 12l7.5-7.5" />
          : <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />}
      </svg>
    </button>
  );
}

// ── Card width helper — resolves to px at runtime based on viewport ────────
function getCardWidth(containerWidth) {
  // 5 cards on xl (≥1280), 4 on lg (≥1024), 3 on md (≥768)
  let count = 3;
  if (containerWidth >= 1280) count = 5;
  else if (containerWidth >= 1024) count = 4;
  const gap = 12;
  return Math.floor((containerWidth - gap * (count - 1)) / count);
}

function FeaturedProducts() {
  const { products, loading, error } = useFeaturedProducts();
  const navigate = useNavigate();

  const scrollRef   = useRef(null);
  const wrapperRef  = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd,   setAtEnd]   = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  // Track viewport breakpoint
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  // Re-check arrow visibility after products load
  useEffect(() => {
    updateArrows();
  }, [products, updateArrows]);

  const scrollBy = (dir) => {
    const el = scrollRef.current;
    const wrapper = wrapperRef.current;
    if (!el || !wrapper) return;
    const cardWidth = getCardWidth(wrapper.clientWidth);
    el.scrollBy({ left: dir === 'left' ? -(cardWidth + 12) : (cardWidth + 12), behavior: 'smooth' });
  };

  // Mobile: 2-col grid (unchanged from original)
  const mobileGridClass = 'grid grid-cols-2 gap-3';

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
        {/* Header */}
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

        {/* Loading skeletons */}
        {loading ? (
          <div className={mobileGridClass}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : null}

        {/* Error */}
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

        {/* Empty */}
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

        {/* Products: carousel on desktop, 2-col grid on mobile */}
        {!loading && !error && products.length > 0 ? (
          <>
            {/* ── MOBILE: 2-column grid ── */}
            <div className={`${mobileGridClass} md:hidden`}>
              {products.map((product) => (
                <FeaturedCard key={product.id} product={product} />
              ))}
            </div>

            {/* ── DESKTOP: horizontal carousel ── */}
            <div
              ref={wrapperRef}
              className="hidden md:block"
              style={{ position: 'relative', padding: '0 22px' }}
            >
              <ArrowButton direction="left"  onClick={() => scrollBy('left')}  hidden={atStart} />
              <ArrowButton direction="right" onClick={() => scrollBy('right')} hidden={atEnd} />

              <div
                ref={scrollRef}
                onScroll={updateArrows}
                style={{
                  display:              'flex',
                  gap:                  '12px',
                  overflowX:            'auto',
                  scrollbarWidth:       'none',
                  msOverflowStyle:      'none',
                  scrollSnapType:       'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  paddingBottom:        '4px',
                }}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      flex:       '0 0 auto',
                      width:      'clamp(180px, calc((100% - 48px) / 5), 260px)',
                      scrollSnapAlign: 'start',
                    }}
                  >
                    <FeaturedCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

export default FeaturedProducts;
