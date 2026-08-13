/**
 * WishlistHeart — Premium minimalist wishlist toggle icon.
 *
 * Renders a solid heart in the top-right corner of a product image.
 * - Default : solid light-grey (#BFC5CF), 60% opacity
 * - Added   : solid red (#FF4D6D) with pop + burst + glow
 * - Hover   : slightly brighter grey, 1.08x scale (desktop only)
 * - Touch   : tap animation replaces hover, same pop/burst on add
 *
 * Guest behaviour (unauthenticated):
 *   Clicking the heart saves/removes the product ID in LocalStorage
 *   without any redirect to login. A wishlist toast confirms the action.
 *   On login the guest wishlist is merged into MongoDB automatically.
 *
 * NOT rendered on ProductDetailPage — pass the component only from
 * ProductCard (compact + standard variants).
 *
 * Props:
 *   productId  {string}  — product ID for wishlist mutation
 *   productName{string}  — used for aria-label
 */
import { useState, useEffect, useRef }   from 'react';
import { useAuth }                       from '@/features/auth/hooks/useAuth';
import { useWishlistQuery, useAddToWishlist, useRemoveFromWishlist }
  from '@/features/wishlist/hooks/useWishlist';
import {
  isInGuestWishlist,
  toggleGuestWishlist,
} from '@/services/guestWishlistService';
import { useToastStore } from '@/store/toastStore';
import './WishlistHeart.css';

const WishlistHeart = ({ productId, productName = 'product' }) => {
  const { user } = useAuth();

  // ── Authenticated path ───────────────────────────────────────────────
  const { data: wishlistItems = [] } = useWishlistQuery();
  const { mutate: add }    = useAddToWishlist();
  const { mutate: remove } = useRemoveFromWishlist();

  // ── Guest path ───────────────────────────────────────────────────────
  // Local state tracks guest wishlist membership so the heart re-renders
  // immediately without a full page re-mount.
  const [guestIn, setGuestIn] = useState(() => isInGuestWishlist(productId));
  const showWishlistToast     = useToastStore((s) => s.showWishlistToast);

  // Derive the effective "is in wishlist" flag for rendering.
  const isInWishlist = user ? wishlistItems.some((item) => item.productId === productId) : guestIn;

  // ── Animation state ──────────────────────────────────────────────────
  const [animating, setAnimating] = useState(false);
  const [burst,     setBurst]     = useState(false);
  const prevRef = useRef(isInWishlist);

  // Trigger pop + burst whenever item is freshly added
  useEffect(() => {
    if (isInWishlist && !prevRef.current) {
      setAnimating(true);
      setBurst(true);
      const t1 = setTimeout(() => setAnimating(false), 280);
      const t2 = setTimeout(() => setBurst(false),     450);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    prevRef.current = isInWishlist;
  }, [isInWishlist]);

  const handleClick = (e) => {
    e.stopPropagation();   // don't navigate to product detail
    e.preventDefault();

    if (!user) {
      // ── Guest: save/remove in LocalStorage, show toast, no redirect ──
      const nowIn = toggleGuestWishlist(productId);
      setGuestIn(nowIn);
      showWishlistToast(nowIn ? 'add' : 'remove');
      return;
    }

    // ── Authenticated: call backend via TanStack mutations ────────────
    if (isInWishlist) {
      remove({ productId });
    } else {
      add({ productId });
    }
  };

  return (
    <button
      className="wh-btn"
      onClick={handleClick}
      aria-label={isInWishlist ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
      aria-pressed={isInWishlist}
      type="button"
    >
      {/* Burst rays — only visible during burst state */}
      {burst && (
        <span className="wh-burst" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="wh-ray" style={{ '--i': i }} />
          ))}
        </span>
      )}

      {/* Heart SVG */}
      <svg
        className={[
          'wh-heart',
          isInWishlist  ? 'wh-heart--added'    : '',
          animating     ? 'wh-heart--pop'      : '',
        ].join(' ').trim()}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
             2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
             C13.09 3.81 14.76 3 16.5 3
             19.58 3 22 5.42 22 8.5
             c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    </button>
  );
};

export default WishlistHeart;
