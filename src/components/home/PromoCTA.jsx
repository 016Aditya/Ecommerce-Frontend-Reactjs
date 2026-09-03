import { Link } from 'react-router-dom';
import PATHS from '@/routes/paths';

function PromoCTA() {
  return (
    <section
      style={{
        width: '100%',
        maxWidth: 'calc(100% - 48px)',
        marginInline: 'auto',
        paddingBlock: '6px 22px',
      }}
    >
      <div
        className="flex flex-col items-center text-center gap-2.5 sm:flex-row sm:items-center sm:text-left sm:justify-between"
        style={{
          borderRadius: '10px',
          padding: '13px 18px',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div>
          <h2 style={{ color: 'var(--text-primary)', fontSize: '14.5px', fontWeight: 700 }}>
            Can't find what you're looking for?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginTop: '1px' }}>
            Browse our complete product catalogue.
          </p>
        </div>

        <Link
          to={PATHS.PRODUCTS}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            fontSize: '13px',
            fontWeight: 700,
            borderRadius: '7px',
            padding: '8px 16px',
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
