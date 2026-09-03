import { Link } from 'react-router-dom';
import PATHS from '@/routes/paths';

function PromoCTA() {
  return (
    <section
      style={{
        width: '100%',
        maxWidth: 'calc(100% - 48px)',
        marginInline: 'auto',
        paddingBlock: '8px 28px',
      }}
    >
      <div
        className="flex flex-col items-center text-center gap-3 sm:flex-row sm:items-center sm:text-left sm:justify-between"
        style={{
          borderRadius: '12px',
          padding: '18px 22px',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 700 }}>
            Can't find what you're looking for?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '2px' }}>
            Browse our complete product catalogue.
          </p>
        </div>

        <Link
          to={PATHS.PRODUCTS}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            fontSize: '13.5px',
            fontWeight: 700,
            borderRadius: '8px',
            padding: '9px 18px',
          }}
        >
          View All Products
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export default PromoCTA;
