import { useEffect } from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import DealSection from '@/components/home/DealSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import SEO from '@/components/common/SEO';
import { useSEO } from '@/hooks/useSEO';
import { prefetchProductsPage } from '@/utils/prefetch';

// ── Trust badge data ──────────────────────────────────────────────────────
const TRUST_BADGES = [
  { icon: '🚚', title: 'Free Delivery',    subtitle: 'On orders over ₹499'       },
  { icon: '🔒', title: 'Secure Payment',   subtitle: '100% safe checkout'        },
  { icon: '🔄', title: 'Easy Returns',     subtitle: '30-day return policy'      },
  { icon: '🎧', title: '24x7 Support',     subtitle: 'Customer support'          },
];

function HomePage() {
  useEffect(() => {
    prefetchProductsPage();
  }, []);

  const { seoProps } = useSEO({
    title: 'Shop Fashion - Discover Latest Trends & Deals',
    description: 'Discover the latest fashion products with fast delivery. Shop clothing, electronics, home & kitchen, and more at the best prices.',
    image: 'https://shop.example.com/og-image.jpg',
    type: 'website',
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <SEO {...seoProps} />
      <HeroBanner />
      <DealSection />

      {/* ── Trust Badge Strip ── */}
      <div
        className="container-app"
        style={{ paddingTop: '0', paddingBottom: '0', marginBottom: '0' }}
      >
        <div
          style={{
            backgroundColor:  'var(--card-bg)',
            border:           '1px solid var(--border-color)',
            borderRadius:     '8px',
            padding:          '16px 24px',
            display:          'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap:              '16px',
          }}
          className="sm:grid-cols-4"
        >
          {TRUST_BADGES.map(({ icon, title, subtitle }) => (
            <div
              key={title}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        '12px',
              }}
            >
              <span style={{ fontSize: '24px', flexShrink: 0 }}>{icon}</span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, margin: 0 }}>
                  {title}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  {subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FeaturedProducts />
    </main>
  );
}

export default HomePage;
