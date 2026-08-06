import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PATHS from "@/routes/paths";

const SLIDES = [
  {
    id: 1,
    title: "Shop Fashion",
    subtitle: "Under ₹999",
    tag: "TOP BRANDS | LATEST TRENDS",
    bg: "from-blue-50 to-indigo-100",
    accent: "#2874f0",
    emoji: "👗",
    cta: "Shop Now",
    category: "Clothing",
  },
  {
    id: 2,
    isFullImage: true,
    imageSrc: "/images/electronics-hero-promo.png.png", // Your active image path
    bg: "bg-[#020817]", // Dark background color matching the image background
    category: "Electronics",
  },
  {
    id: 3,
    title: "Books & More",
    subtitle: "Starting ₹99",
    tag: "BESTSELLERS | NEW ARRIVALS",
    bg: "from-orange-50 to-amber-100",
    accent: "#e07d00",
    emoji: "📚",
    cta: "Browse All",
    category: "Books",
  },
  {
    id: 4,
    title: "Home & Living",
    subtitle: "Revamp in Style",
    tag: "FURNITURE | DECOR | KITCHEN",
    bg: "from-green-50 to-emerald-100",
    accent: "#26a541",
    emoji: "🏠",
    cta: "Shop Home",
    category: "Home",
  },
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

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

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  const handleDot = (e, i) => {
    e.stopPropagation();
    setCurrent(i);
  };

  return (
    <div className="hero-banner relative overflow-hidden">
      {/* Entire banner clickable */}
      <div
        className={`transition-all duration-700 cursor-pointer min-h-[260px] sm:min-h-[320px] md:min-h-[360px] flex items-center justify-center ${
          slide.isFullImage ? slide.bg : `bg-gradient-to-r ${slide.bg}`
        }`}
        onClick={goToCategory}
        role="link"
        tabIndex={0}
        aria-label={`Shop ${slide.category}`}
        onKeyDown={(e) => e.key === "Enter" && goToCategory()}
      >
        {slide.isFullImage ? (
          /* NO CROPPING: Entire promo image is 100% visible and centered */
          <div className="w-full h-[260px] sm:h-[320px] md:h-[360px] flex items-center justify-center p-2">
            <img
              src={slide.imageSrc}
              alt="Electronics Sale Promo"
              className="w-full h-full object-contain pointer-events-none select-none"
              loading="eager"
              draggable={false}
            />
          </div>
        ) : (
          /* Standard layout for Fashion, Books, and Home */
          <div
            className="
              container-app
              flex
              items-center
              justify-between
              gap-8
              lg:gap-12
              w-full
              z-10
            "
            style={{ paddingTop: "clamp(21px, 5.25vw, 34px)", paddingBottom: "clamp(21px, 5.25vw, 34px)" }}
          >
            {/* Left content */}
            <div className="hero-banner__content flex flex-col gap-3 max-w-[460px]">
              <span
                className="text-xs font-bold tracking-widest"
                style={{ color: slide.accent }}
              >
                {slide.tag}
              </span>
              <h1
                className="hero-banner__title font-extrabold text-slate-900"
                style={{ fontSize: "clamp(26px, 6vw, 48px)" }}
              >
                {slide.title}
              </h1>
              <p
                className="hero-banner__subtitle font-bold text-slate-700"
                style={{ fontSize: "clamp(16px, 3.5vw, 26px)" }}
              >
                {slide.subtitle}
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToCategory();
                }}
                className="hero-banner__cta mt-2 rounded-sm px-8 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90 w-fit"
                style={{ backgroundColor: slide.accent }}
              >
                {slide.cta}
              </button>
            </div>

            {/* Right Side - Emoji */}
            <div className="hidden sm:flex flex-1 justify-end items-center relative h-full">
              <div
                className="hero-banner__emoji select-none drop-shadow-lg"
                style={{
                  fontSize: "clamp(64px, 10vw, 161px)",
                }}
                aria-hidden="true"
              >
                {slide.emoji}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prev arrow */}
      <button
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition z-20"
        aria-label="Previous slide"
      >
        <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Next arrow */}
      <button
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow hover:bg-white transition z-20"
        aria-label="Next slide"
      >
        <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={(e) => handleDot(e, i)}
            className={`h-2 rounded-full transition-all ${
              i === current ? "w-6 bg-[#2874f0]" : "w-2 bg-slate-300"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroBanner;