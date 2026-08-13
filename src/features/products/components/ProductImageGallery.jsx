import { useEffect, useRef, useState } from 'react';
import '../styles/ProductDetail.css';

const PLACEHOLDER = 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image';

const getTouchDistance = (touches) => {
  const [a, b] = touches;
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
};

/**
 * ProductImageGallery
 * Displays a main image + thumbnail row.
 * Hero image uses eager loading + fetchPriority="high" to improve LCP.
 * Thumbnail images use lazy loading since they are below the fold.
 */
const ProductImageGallery = ({ imageUrl, name }) => {
  const images = imageUrl ? [imageUrl] : [];
  const [active, setActive] = useState(images[0] ?? null);
  const [zoomed, setZoomed] = useState(false);
  const mainRef = useRef(null);
  const pinchDistanceRef = useRef(null);

  const src = active ?? PLACEHOLDER;

  // Tap outside the image closes the zoom (mobile).
  useEffect(() => {
    if (!zoomed) return undefined;

    const handleOutside = (event) => {
      if (mainRef.current && !mainRef.current.contains(event.target)) {
        setZoomed(false);
      }
    };

    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [zoomed]);

  const handleTouchStart = (event) => {
    if (event.touches.length === 1) {
      setZoomed(true);
    } else if (event.touches.length === 2) {
      pinchDistanceRef.current = getTouchDistance(event.touches);
    }
  };

  const handleTouchMove = (event) => {
    if (event.touches.length === 2 && pinchDistanceRef.current != null) {
      const distance = getTouchDistance(event.touches);
      // Fingers pinching together (pinch-out gesture) closes the zoom.
      if (distance < pinchDistanceRef.current - 15) {
        setZoomed(false);
      }
      pinchDistanceRef.current = distance;
    }
  };

  const handleTouchEnd = (event) => {
    if (event.touches.length < 2) {
      pinchDistanceRef.current = null;
    }
  };

  return (
    <div className="pdp-gallery">
      {/* Main image — eager + high priority for LCP */}
      <div
        ref={mainRef}
        className="pdp-gallery__main"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={src}
          alt={name}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width={400}
          height={400}
          className={`transition-transform duration-200 ease-out md:hover:scale-110 ${zoomed ? 'scale-110' : 'scale-100'}`}
        />
      </div>

      {/* Thumbnails — lazy load since they are below the fold */}
      {images.length > 1 && (
        <div className="pdp-gallery__thumbs">
          {images.map((url, i) => (
            <button
              key={i}
              className={`pdp-gallery__thumb${active === url ? ' pdp-gallery__thumb--active' : ''}`}
              onClick={() => setActive(url)}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={url}
                alt={`${name} ${i + 1}`}
                loading="lazy"
                decoding="async"
                width={80}
                height={80}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
