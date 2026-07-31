import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PATHS from '@/routes/paths';
import useAuth from '@/features/auth/hooks/useAuth';
import { useWishlistQuery } from '@/features/wishlist/hooks/useWishlist';
import { getGuestWishlist } from '@/features/wishlist/services/guestWishlistService';

// ── Guest wishlist count hook (mirrors Navbar.jsx exactly) ──────────────
function useGuestWishlistCount() {
  const [count, setCount] = useState(() => getGuestWishlist().length);
  useEffect(() => {
    const sync = () => setCount(getGuestWishlist().length);
    window.addEventListener('guestWishlistUpdated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('guestWishlistUpdated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return count;
}

// ── SVG Icons ────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const CategoriesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const OrdersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);

const WishlistIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

const AccountIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ── Tab definitions ───────────────────────────────────────────────────────
const TABS = [
  { id: 'home',       label: 'Home',       Icon: HomeIcon,       publicPath: PATHS.HOME,      privatePath: PATHS.HOME      },
  { id: 'categories', label: 'Categories', Icon: CategoriesIcon, publicPath: PATHS.PRODUCTS,  privatePath: PATHS.PRODUCTS  },
  { id: 'orders',     label: 'Orders',     Icon: OrdersIcon,     publicPath: PATHS.LOGIN,     privatePath: PATHS.ORDERS    },
  { id: 'wishlist',   label: 'Wishlist',   Icon: WishlistIcon,   publicPath: PATHS.LOGIN,     privatePath: PATHS.WISHLIST, hasBadge: true },
  { id: 'account',    label: 'Account',    Icon: AccountIcon,    publicPath: PATHS.LOGIN,     privatePath: PATHS.PROFILE   },
];

function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  // Wishlist counts — mirrors Navbar.jsx dual-mode logic exactly
  const { data: wishlistItems = [] } = useWishlistQuery();
  const guestWishlistCount           = useGuestWishlistCount();
  const wishlistCount = user ? wishlistItems.length : guestWishlistCount;

  return (
    <nav
      className="md:hidden"
      style={{
        position:        'fixed',
        bottom:          0,
        left:            0,
        right:           0,
        height:          '56px',
        backgroundColor: 'var(--navbar-bg)',
        borderTop:       '1px solid var(--border-color)',
        zIndex:          50,
        display:         'flex',
        alignItems:      'stretch',
      }}
    >
      {TABS.map(({ id, label, Icon, publicPath, privatePath, hasBadge }) => {
        const to         = user ? privatePath : publicPath;
        const isActive   = location.pathname === to ||
                           (id === 'categories' && location.pathname.startsWith(PATHS.PRODUCTS)) ||
                           (id === 'orders'     && location.pathname.startsWith(PATHS.ORDERS))   ||
                           (id === 'wishlist'   && location.pathname === PATHS.WISHLIST)         ||
                           (id === 'account'    && location.pathname.startsWith(PATHS.PROFILE));
        const color      = isActive ? 'var(--accent, #ff9f00)' : '#94a3b8';
        const badgeCount = hasBadge ? wishlistCount : 0;

        return (
          <Link
            key={id}
            to={to}
            aria-label={label}
            style={{
              flex:           1,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '3px',
              color,
              textDecoration: 'none',
              transition:     'color 150ms ease',
              WebkitTapHighlightColor: 'transparent',
              position:       'relative',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent, #ff9f00)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = color)}
          >
            {/* Icon wrapper with optional badge */}
            <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon />
              {badgeCount > 0 && (
                <span
                  style={{
                    position:        'absolute',
                    top:             '-5px',
                    right:           '-7px',
                    minWidth:        '16px',
                    height:          '16px',
                    display:         'flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    borderRadius:    '9999px',
                    fontSize:        '9px',
                    fontWeight:      800,
                    backgroundColor: 'var(--accent, #ff9f00)',
                    color:           '#0f1111',
                    padding:         '0 2px',
                    lineHeight:      1,
                  }}
                >
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </span>

            {/* Label */}
            <span
              style={{
                fontSize:   '10px',
                fontWeight: 500,
                lineHeight: 1,
                color:      'inherit',
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default BottomNav;
