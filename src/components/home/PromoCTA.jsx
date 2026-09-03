import { Link } from 'react-router-dom';
import PATHS from '@/routes/paths';

function PromoCTA() {
  return (
    <section
      style={{
        width: '100%',
        maxWidth: 'calc(100% - 48px)',
        marginInline: 'auto',
        paddingBlock: '8px 32px',
      }}
    >
      <div
        className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:justify-between"
        style={{
          borderRadius: '20px',
          padding: '36px 28px',
          gap: '20px',
          background: 'linear-gradient(135deg, #131921 0%, #1f2b3d 55%, #2c3e50 100%)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div>
          <h2
            style={{
              color: '#ffffff',
              fontSize: 'clamp(20px, 3.2vw, 28px)',
              fontWeight: 800,
              lineHeight: 1.25,
            }}
          >
            Didn't find what you were looking for?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: '14.5px',
              marginTop: '8px',
              maxWidth: '480px',
            }}
          >
            Browse the full catalogue across Electronics, Fashion, Home, Books and more.
          </p>
        </div>

        <Link
          to={PATHS.PRODUCTS}
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap transition-transform hover:-translate-y-0.5"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            fontSize: '14.5px',
            fontWeight: 700,
            borderRadius: '10px',
            padding: '12px 24px',
          }}
        >
          Browse All Products
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}

export default PromoCTA;
