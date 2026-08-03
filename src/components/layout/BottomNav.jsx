import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import PATHS from '@/routes/paths';
import useAuth from '@/features/auth/hooks/useAuth';
import { useWishlistQuery } from '@/features/wishlist/hooks/useWishlist';
import { getGuestWishlist } from '@/services/guestWishlistService';

// This component is rendered only below the existing md breakpoint.
const navItems = [
  { label: 'Home', to: PATHS.HOME, icon: <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z" /> },
  { label: 'Orders', to: PATHS.ORDERS, icon: <><path d="M6 3h12a2 2 0 0 1 2 2v16H4V5a2 2 0 0 1 2-2Z" /><path d="M8 8h8M8 12h8M8 16h5" /></> },
  { label: 'Categories', to: PATHS.PRODUCTS, icon: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></> },
  { label: 'Wishlist', to: PATHS.WISHLIST, icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" /> },
  { label: 'Account', to: PATHS.PROFILE, icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></> },
];

function useGuestWishlistCount() {
  const [count, setCount] = useState(() => getGuestWishlist().length);

  useEffect(() => {
    const syncCount = () => setCount(getGuestWishlist().length);
    window.addEventListener('guestWishlistUpdated', syncCount);
    window.addEventListener('storage', syncCount);
    return () => {
      window.removeEventListener('guestWishlistUpdated', syncCount);
      window.removeEventListener('storage', syncCount);
    };
  }, []);

  return count;
}

export default function BottomNav() {
  const { user } = useAuth();
  const { data: wishlistItems = [] } = useWishlistQuery();
  const guestWishlistCount = useGuestWishlistCount();
  const wishlistCount = user ? wishlistItems.length : guestWishlistCount;

  return (
    <nav className="bottom-nav md:hidden" aria-label="Mobile navigation">
      {navItems.map((item) => (
        <NavLink key={item.label} to={item.to} end={item.to === PATHS.HOME} className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}>
          <span className="bottom-nav__icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{item.icon}</svg>
            {item.label === 'Wishlist' && wishlistCount > 0 ? (
              <span className="bottom-nav__badge">{wishlistCount > 99 ? '99+' : wishlistCount}</span>
            ) : null}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
