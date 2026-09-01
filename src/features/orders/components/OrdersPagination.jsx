const SIBLINGS = 1;

/**
 * Builds a compact page list with ellipses, e.g. for page=4, total=10:
 * [0, 'left-ellipsis', 3, 4, 5, 'right-ellipsis', 9]
 */
function buildPageList(current, total) {
  const windowSize = SIBLINGS * 2 + 5; // first + last + current + 2 siblings + 2 ellipsis slots
  if (total <= windowSize) {
    return Array.from({ length: total }, (_, i) => i);
  }

  const left  = Math.max(current - SIBLINGS, 1);
  const right = Math.min(current + SIBLINGS, total - 2);

  const pages = [0];
  if (left > 1) pages.push('left-ellipsis');
  for (let i = left; i <= right; i += 1) pages.push(i);
  if (right < total - 2) pages.push('right-ellipsis');
  pages.push(total - 1);

  return pages;
}

const ChevronIcon = ({ direction }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d={direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
    />
  </svg>
);

export default function OrdersPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = buildPageList(currentPage, totalPages);

  return (
    <nav className="orders-pagination" aria-label="Orders pagination">
      <button
        type="button"
        className="orders-pagination__arrow"
        disabled={currentPage === 0}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronIcon direction="left" />
      </button>

      <div className="orders-pagination__pages">
        {pages.map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={p}
              type="button"
              className={`orders-pagination__page${p === currentPage ? ' is-active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              aria-label={`Page ${p + 1}`}
            >
              {p + 1}
            </button>
          ) : (
            <span key={`${p}-${idx}`} className="orders-pagination__ellipsis" aria-hidden="true">
              &middot;&middot;&middot;
            </span>
          )
        )}
      </div>

      <button
        type="button"
        className="orders-pagination__arrow"
        disabled={currentPage === totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronIcon direction="right" />
      </button>
    </nav>
  );
}
