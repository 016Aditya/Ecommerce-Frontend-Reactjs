import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PATHS from '@/routes/paths';

const productPath = (category, subcategory) => {
  const params = new URLSearchParams({ category });
  if (subcategory) params.set('subcategory', subcategory);
  return `${PATHS.PRODUCTS}?${params.toString()}`;
};

const CATEGORY_PAGES = [
  [
    { name: 'Mobiles', emoji: '📱', to: productPath('Electronics', 'Mobile') },
    { name: 'Laptops', emoji: '💻', to: productPath('Electronics', 'Laptop') },
    { name: 'Earphones', emoji: '🎧', to: productPath('Electronics', 'Headphones') },
    { name: 'Cameras', emoji: '📷', to: productPath('Electronics', 'Camera') },
    { name: "Men's Wear", emoji: '👔', to: productPath('Clothing', 'Shirt') },
    { name: "Women's", emoji: '👗', to: productPath('Clothing', 'Dress') },
    { name: 'Footwear', emoji: '👟', to: productPath('Clothing', 'Shoes') },
    { name: 'Accessories', emoji: '👝', to: productPath('Clothing') },
  ],
  [
    { name: 'Furniture', emoji: '🛋️', to: productPath('Home', 'Furniture') },
    { name: 'Kitchen', emoji: '🍳', to: productPath('Home', 'Kitchen') },
    { name: 'Decor', emoji: '🪴', to: productPath('Home', 'Decor') },
    { name: 'Bedding', emoji: '🛏️', to: productPath('Home') },
    { name: 'Bestsellers', emoji: '📚', to: productPath('Books', 'Novel') },
    { name: 'Sports Gear', emoji: '⚽', to: productPath('Sports') },
    { name: 'Fitness', emoji: '🏋️', to: productPath('Sports', 'Gym') },
    { name: 'Outdoor', emoji: '🏕️', to: productPath('Sports') },
  ],
];

function MobileCategories() {
  const carouselRef = useRef(null);
  const frameRef = useRef(null);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => () => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
  }, []);

  const handleScroll = () => {
    if (frameRef.current) return;

    frameRef.current = window.requestAnimationFrame(() => {
      const carousel = carouselRef.current;
      if (carousel) {
        const page = Math.round(carousel.scrollLeft / carousel.clientWidth);
        setActivePage(Math.max(0, Math.min(page, CATEGORY_PAGES.length - 1)));
      }
      frameRef.current = null;
    });
  };

  const goToPage = (page) => {
    carouselRef.current?.scrollTo({
      left: carouselRef.current.clientWidth * page,
      behavior: 'smooth',
    });
  };

  return (
    <section className="mobile-categories md:hidden" aria-label="Shop by category">
      <div
        ref={carouselRef}
        className="mobile-categories__carousel"
        onScroll={handleScroll}
      >
        {CATEGORY_PAGES.map((categories, pageIndex) => (
          <div
            className="mobile-categories__page"
            key={`category-page-${pageIndex + 1}`}
            aria-label={`Category page ${pageIndex + 1} of ${CATEGORY_PAGES.length}`}
          >
            {categories.map((category) => (
              <Link
                className="mobile-categories__item"
                key={category.name}
                to={category.to}
              >
                <span className="mobile-categories__icon" aria-hidden="true">{category.emoji}</span>
                <span className="mobile-categories__name">{category.name}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="mobile-categories__pagination" aria-label="Category pages">
        {CATEGORY_PAGES.map((_, pageIndex) => (
          <button
            aria-label={`Go to category page ${pageIndex + 1}`}
            aria-current={activePage === pageIndex ? 'true' : undefined}
            className={`mobile-categories__dot${activePage === pageIndex ? ' mobile-categories__dot--active' : ''}`}
            key={pageIndex}
            onClick={() => goToPage(pageIndex)}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}

export default MobileCategories;
