import { useEffect } from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import MobileHeroBanner from '@/components/home/MobileHeroBanner';
import TrustBadges from '@/components/home/TrustBadges';
import DealSection from '@/components/home/DealSection';
import MobileCategories from '@/components/home/MobileCategories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TopRated from '@/components/home/TopRated';
import WhyShopWithUs from '@/components/home/WhyShopWithUs';
import PromoCTA from '@/components/home/PromoCTA';
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
      <div className="md:hidden"><MobileHeroBanner /></div>
      <div className="hidden md:block" style={{ marginBottom: '20px' }}><HeroBanner /></div>
      <div className="hidden md:block"><TrustBadges /></div>
      <div className="hidden md:block"><DealSection /></div>
      <MobileCategories />
      <FeaturedProducts />
      <div className="hidden md:block" style={{ marginTop: '16px' }}><TopRated /></div>
      <div className="hidden md:block" style={{ marginTop: '35px' }}><WhyShopWithUs /></div>
      <div className="hidden md:block" style={{ marginTop: '16px' }}><PromoCTA /></div>
    </main>
  );
}

export default HomePage;
