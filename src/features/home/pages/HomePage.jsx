import { useEffect } from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import DealSection from '@/components/home/DealSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import SEO from '@/components/common/SEO';
import { useSEO } from '@/hooks/useSEO';
import { prefetchProductsPage } from '@/utils/prefetch';

function HomePage() {
  // Stage 1: prefetch the Products page during idle time so navigation
  // from Home → Products feels instant.
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
      <FeaturedProducts />
    </main>
  );
}

export default HomePage;
