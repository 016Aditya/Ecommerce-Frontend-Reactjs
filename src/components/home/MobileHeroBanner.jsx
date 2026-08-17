import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PATHS from "@/routes/paths";
import { HERO_SLIDES as SLIDES } from "./heroSlides";

function MobileHeroBanner() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const touchStartX = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  const goToCategory = () => {
    navigate({
      pathname: PATHS.PRODUCTS,
      search: `?category=${slide.category}`,
    });
  };

  const handleDot = (e, i) => {
    e.stopPropagation();
    setCurrent(i);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX > 0) {
      setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    } else {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }
  };

  return (
    <div className="mobile-hero-banner relative overflow-hidden">
      {/* Full-bleed, edge-to-edge image sized to the banner's native 16:9 ratio */}
      <div
        className={`transition-all duration-700 cursor-pointer w-full aspect-[16/9] ${slide.bg}`}
        onClick={goToCategory}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="link"
        tabIndex={0}
        aria-label={`Shop ${slide.category}`}
        onKeyDown={(e) => e.key === "Enter" && goToCategory()}
      >
        <img
          src={slide.imageSrc}
          alt={`${slide.category} Sale Promo`}
          className="w-full h-full object-cover pointer-events-none select-none"
          width={860}
          height={491}
          loading="eager"
          fetchPriority="high"
          draggable={false}
        />
      </div>

      {/* Slide Indicators / Dots (swipe replaces arrow buttons on mobile) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={(e) => handleDot(e, i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current ? "w-5 bg-[#2874f0]" : "w-1.5 bg-white/70"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default MobileHeroBanner;
