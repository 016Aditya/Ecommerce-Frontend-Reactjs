import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import PATHS from "@/routes/paths";
import { CATEGORY_GROUPS } from "@/constants/categoryTaxonomy";
import { useCartQuery, useGuestCartCount } from "@/features/cart/hooks/useCart";
import { useWishlistQuery } from "@/features/wishlist/hooks/useWishlist";
import { getGuestWishlist } from "@/services/guestWishlistService";
import useAuth from "@/features/auth/hooks/useAuth";
import { useToastStore } from '@/store/toastStore';
import ThemeToggle from "@/components/common/ThemeToggle";
import SearchInput from "@/features/products/components/SearchInput";
import SearchOverlayMobile from "@/features/products/components/SearchOverlayMobile";

const CLOTHING_SUBS = [
  { label: "All Fashion", sub: null },
  { label: "Shirt",   sub: "Shirt"  },
  { label: "Jeans",   sub: "Jeans"  },
  { label: "Dress",   sub: "Dress"  },
  { label: "Shoes",   sub: "Shoes"  },
  { label: "Jacket",  sub: "Jacket" },
  { label: "Kurta",   sub: "Kurta"  },
];

const NAV_LINKS = [
  { label: "Today's Deals",    path: PATHS.PRODUCTS,  dropdown: null },
  { label: "Mobiles",          path: `${PATHS.PRODUCTS}?category=Electronics&subcategory=Mobile`, dropdown: null },
  { label: "Fashion",          path: `${PATHS.PRODUCTS}?category=Clothing`, dropdown: CLOTHING_SUBS },
  { label: "Electronics",      path: `${PATHS.PRODUCTS}?category=Electronics`, dropdown: null },
  { label: "Home & Kitchen",   path: `${PATHS.PRODUCTS}?category=Home`,        dropdown: null },
  { label: "Books",            path: `${PATHS.PRODUCTS}?category=Books`,        dropdown: null },
  { label: "Sports",           path: `${PATHS.PRODUCTS}?category=Sports`,       dropdown: null },
  { label: "New Releases",     path: PATHS.PRODUCTS,  dropdown: null },
  { label: "Customer Service", path: PATHS.CUSTOMER_SERVICE, dropdown: null },
];

const MORE_CATS = [
  { label: "Today's Deal",   path: PATHS.PRODUCTS },
  { label: "Electronics",    path: `${PATHS.PRODUCTS}?category=Electronics` },
  { label: "Camera",         path: `${PATHS.PRODUCTS}?category=Electronics&subcategory=Camera` },
  { label: "Fashion",        path: `${PATHS.PRODUCTS}?category=Clothing` },
  { label: "Home & Kitchen", path: `${PATHS.PRODUCTS}?category=Home` },
  { label: "Kitchen",        path: `${PATHS.PRODUCTS}?category=Home` },
  { label: "Books and Sports", path: `${PATHS.PRODUCTS}?category=Books` },
  { label: "Furniture",      path: `${PATHS.PRODUCTS}?category=Furniture` },
  { label: "Decor",          path: `${PATHS.PRODUCTS}?category=Decor` },
];

const navItemBase = {
  display:        "flex",
  flexShrink:     0,
  alignItems:     "center",
  borderRadius:   "2px",
  padding:        "4px 8px",
  cursor:         "pointer",
  border:         "1px solid transparent",
  transition:     "border-color 0.15s ease",
  textDecoration: "none",
};

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

function Navbar() {
  const { data: cartData }           = useCartQuery();
  const authCartItems                = cartData?.items ?? [];
  const authCartTotal                = authCartItems.reduce((sum, i) => sum + (i.quantity ?? 0), 0);

  // Guest cart count — live, subscribed to guestCartUpdated + storage events
  const guestCartCount               = useGuestCartCount();

  const { data: wishlistItems = [] }  = useWishlistQuery();
  const guestWishlistCount            = useGuestWishlistCount();
  const { user, logout }             = useAuth();

  // Unified badge counts: auth → backend, guest → localStorage
  const totalItems    = user ? authCartTotal   : guestCartCount;
  const wishlistCount = user ? wishlistItems.length : guestWishlistCount;

  const showToast  = useToastStore((state) => state.showToast);
  const navigate   = useNavigate();
  const location   = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [drawerOpen,        setDrawerOpen]        = useState(false);
  const [drawerVisible,     setDrawerVisible]     = useState(false);
  const [mobileSearchOpen,  setMobileSearchOpen]  = useState(false);
  const query = searchParams.get("search") || "";

  // Desktop category bar dropdowns ("All Categories" mega menu + per-link
  // dropdowns like Fashion). position:"fixed", computed from the trigger's
  // own rect on hover — see the "DESKTOP CATEGORY BAR" comment below for why.
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(null);
  const [categoryMenuPos,  setCategoryMenuPos]  = useState({ left: 0, top: 0 });

  const openCategoryMenu = (id, triggerEl) => {
    const rect = triggerEl?.getBoundingClientRect();
    if (rect) setCategoryMenuPos({ left: rect.left, top: rect.bottom });
    setCategoryMenuOpen(id);
  };
  const closeCategoryMenu = () => setCategoryMenuOpen(null);

  useEffect(() => {
    if (drawerOpen) {
      requestAnimationFrame(() => setDrawerVisible(true));
    } else {
      setDrawerVisible(false);
    }
  }, [drawerOpen]);

  const closeDrawer = () => {
    setDrawerVisible(false);
    setTimeout(() => setDrawerOpen(false), 260);
  };

  useEffect(() => {
    if (mobileMenuOpen) {
      requestAnimationFrame(() => setMobileMenuVisible(true));
    } else {
      setMobileMenuVisible(false);
    }
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuVisible(false);
    setTimeout(() => setMobileMenuOpen(false), 220);
  };

  // Swipe-left-to-close for the mobile hamburger sidebar
  const [menuDragX, setMenuDragX] = useState(0);
  const [menuDragging, setMenuDragging] = useState(false);
  const menuTouchRef = useRef({ startX: 0, startY: 0, dragging: false });

  const handleMenuTouchStart = (e) => {
    const t = e.touches[0];
    menuTouchRef.current = { startX: t.clientX, startY: t.clientY, dragging: true };
    setMenuDragging(true);
  };

  const handleMenuTouchMove = (e) => {
    if (!menuTouchRef.current.dragging) return;
    const t = e.touches[0];
    const deltaX = t.clientX - menuTouchRef.current.startX;
    const deltaY = t.clientY - menuTouchRef.current.startY;
    if (Math.abs(deltaY) > Math.abs(deltaX)) return; // vertical scroll, ignore
    if (deltaX < 0) setMenuDragX(deltaX);
  };

  const handleMenuTouchEnd = () => {
    if (!menuTouchRef.current.dragging) return;
    menuTouchRef.current.dragging = false;
    const shouldClose = menuDragX < -60;
    if (shouldClose) closeMobileMenu();
    // Stay at the dragged position (transition still off) for one more paint
    // before re-enabling the transition — flipping both `transition` and
    // `transform` in the same commit makes the browser skip the animation
    // and snap straight to the end state instead of sliding.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMenuDragging(false);
        setMenuDragX(0);
      });
    });
  };

  const handleSearch = (term) => {
    if (!term.trim()) return;
    navigate(`${PATHS.PRODUCTS}?search=${encodeURIComponent(term.trim())}`);
  };
  const handleLogout = () => {
    logout();
    showToast({
      type: 'success',
      title: 'See You Again',
      message: 'Signed out successfully.',
    });
    navigate(PATHS.LOGIN);
  };
  const displayName = user?.firstName || user?.name || "User";

  return (
    <header className="sticky top-0 z-50 shadow-md" style={{ colorScheme: "dark" }}>

      {/* ══ DESKTOP PRIMARY BAR ══ */}
      <div className="hidden md:block" style={{ backgroundColor: "var(--navbar-bg)", minHeight: "74px" }}>
        <div style={{ maxWidth:"1346px", margin:"0 auto", padding:"2px 19px", minHeight:"74px", display:"flex", alignItems:"center", gap:"11px" }}>
          <Link to={PATHS.HOME} aria-label="ShopApp Home"
            style={{ ...navItemBase, flexDirection:"column", alignItems:"flex-start", padding:"4px 7px 4px 13px", minWidth:"150px", flexShrink:0 }}
            onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
            onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
            <span style={{ fontSize:"24px", fontWeight:800, color:"#fff", lineHeight:1.2, letterSpacing:"-0.4px" }}>
              shop<span style={{ color:"var(--accent, #ff9f00)" }}>App</span>
            </span>
            <span style={{ fontSize:"10px", color:"#94a3b8", lineHeight:1, marginTop:"2px", fontStyle:"italic" }}>.in</span>
          </Link>

          <SearchInput
            initialValue={query}
            onSearch={handleSearch}
            placeholder="Search products, brands and more..."
            className="flex-1 min-w-0 mr-[-10px]"
            containerStyle={{
              borderRadius: "2px",
              overflow: "hidden",
              border: "2px solid var(--accent, #ff9f00)",
              backgroundColor: "#fff",
              padding: "0",
              gap: "0",
            }}
            inputClassName="px-4 text-[15px]"
            inputStyle={{ color: "#0f1111", paddingBlock: "10px" }}
            buttonClassName="flex w-[62px] self-stretch items-center justify-center"
            buttonStyle={{ backgroundColor: "var(--accent, #ff9f00)", color: "#0f1111" }}
          />

          <div style={{ display:"flex", alignItems:"center", gap:"11px", flexShrink:0 }}>
            {user ? (
              <div className="group" style={{ position:"relative" }}>
                <div style={{ ...navItemBase, flexDirection:"column", alignItems:"flex-start", padding:"4px 11px" }}
                  onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
                  onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
                  <span style={{ fontSize:"11.5px", color:"#cbd5e1", lineHeight:1.4 }}>Hello, {displayName}</span>
                  <span style={{ fontSize:"15px", fontWeight:700, color:"#fff", lineHeight:1.4 }}>Account</span>
                </div>
                <div className="group-hover:block hidden"
                  style={{ position:"absolute", top:"100%", right:0, minWidth:"180px", backgroundColor:"var(--modal-bg, #fff)", border:"1px solid var(--border-color, #ddd)", borderRadius:"4px", boxShadow:"0 4px 16px rgba(0,0,0,0.18)", zIndex:9999 }}>
                  <Link to={PATHS.PROFILE}  style={{ display:"block", padding:"10px 16px", fontSize:"14px", color:"var(--text-primary)", textDecoration:"none", backgroundColor:"transparent" }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor="var(--hover-bg)"} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor="transparent"}>Profile</Link>
                  <Link to={PATHS.ORDERS}   style={{ display:"block", padding:"10px 16px", fontSize:"14px", color:"var(--text-primary)", textDecoration:"none", backgroundColor:"transparent" }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor="var(--hover-bg)"} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor="transparent"}>My Orders</Link>
                  <Link to={PATHS.WISHLIST} style={{ display:"block", padding:"10px 16px", fontSize:"14px", color:"var(--text-primary)", textDecoration:"none", backgroundColor:"transparent" }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor="var(--hover-bg)"} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor="transparent"}>Wishlist {wishlistCount > 0 && `(${wishlistCount})`}</Link>
                  <hr style={{ borderColor:"var(--border-color,#eee)", margin:0 }} />
                  <button onClick={handleLogout} style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 16px", fontSize:"14px", color:"var(--text-primary)", backgroundColor:"transparent", border:"none", cursor:"pointer" }} onMouseEnter={(e)=>e.currentTarget.style.backgroundColor="var(--hover-bg)"} onMouseLeave={(e)=>e.currentTarget.style.backgroundColor="transparent"}>Sign Out</button>
                </div>
              </div>
            ) : (
              <Link to={PATHS.LOGIN} style={{ ...navItemBase, flexDirection:"column", alignItems:"flex-start", padding:"4px 10px" }}
                onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
                onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
                <span style={{ fontSize:"11px", color:"#cbd5e1", lineHeight:1.4 }}>Hello, sign in</span>
                <span style={{ fontSize:"15px", fontWeight:700, color:"#fff", lineHeight:1.4 }}>Account &amp; Lists</span>
              </Link>
            )}
            <Link to={PATHS.ORDERS} style={{ ...navItemBase, flexDirection:"column", alignItems:"flex-start", padding:"4px 10px" }}
              onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
              onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
              <span style={{ fontSize:"11px", color:"#cbd5e1", lineHeight:1.4 }}>Returns</span>
              <span style={{ fontSize:"15px", fontWeight:700, color:"#fff", lineHeight:1.4 }}>&amp; Orders</span>
            </Link>
            <Link to={PATHS.WISHLIST} aria-label="Wishlist" style={{ ...navItemBase, gap:"6px", padding:"4px 10px" }}
              onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
              onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
              <div style={{ position:"relative", display:"flex" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                {wishlistCount > 0 && (
                  <span style={{ position:"absolute", top:"-5px", left:"14px", minWidth:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"9999px", fontSize:"10px", fontWeight:800, backgroundColor:"var(--accent,#ff9f00)", color:"#0f1111", padding:"0 3px" }}>
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize:"15px", fontWeight:700, color:"#fff", marginBottom:"2px" }}>Wishlist</span>
            </Link>
            <Link to={PATHS.CART} aria-label="Cart" style={{ ...navItemBase, gap:"6px", padding:"4px 10px" }}
              onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
              onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
              <div style={{ position:"relative", display:"flex" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {totalItems > 0 && (
                  <span style={{ position:"absolute", top:"-5px", left:"14px", minWidth:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"9999px", fontSize:"10px", fontWeight:800, backgroundColor:"var(--accent,#ff9f00)", color:"#0f1111", padding:"0 3px" }}>
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>
              <span style={{ fontSize:"15px", fontWeight:700, color:"#fff", marginBottom:"2px" }}>Cart</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ══ MOBILE NAVBAR ══ */}
      <div className="md:hidden" style={{ backgroundColor: "var(--navbar-bg)" }}>

        {/* Row 1: Hamburger · Logo · spacer · Account · Cart · ThemeToggle */}
        <div style={{ display:"flex", alignItems:"center", padding:"10.5px 12px 8.4px", gap:"8px" }}>
          <button aria-label="Open menu" onClick={()=> mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true)}
            style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", flexShrink:0, display:"flex", alignItems:"center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6"  />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link to={PATHS.HOME} aria-label="ShopApp Home" style={{ textDecoration:"none", flexShrink:0 }}>
            <span style={{ fontSize:"20px", fontWeight:800, color:"#fff", letterSpacing:"-0.3px" }}>
              shop<span style={{ color:"var(--accent, #ff9f00)" }}>App</span>
            </span>
            <span style={{ fontSize:"11px", color:"#94a3b8", fontStyle:"italic", marginLeft:"1px" }}>.in</span>
          </Link>
          <div style={{ flex:1 }} />
          {user ? (
            <Link to={PATHS.PROFILE} style={{ display:"flex", alignItems:"center", gap:"4px", textDecoration:"none", flexShrink:1, minWidth:0 }}>
              <span style={{ fontSize:"13px", fontWeight:600, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"88px" }}>{displayName}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><polyline points="9 18 15 12 9 6" /></svg>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          ) : (
            <Link to={PATHS.LOGIN} style={{ textDecoration:"none", flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          )}
          <Link to={PATHS.CART} aria-label="Cart" style={{ position:"relative", display:"flex", alignItems:"center", textDecoration:"none", flexShrink:0, marginLeft:"1%" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            {totalItems > 0 && (
              <span style={{ position:"absolute", top:"-6px", right:"-6px", minWidth:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"9999px", fontSize:"10px", fontWeight:800, backgroundColor:"var(--accent,#ff9f00)", color:"#0f1111", padding:"0 3px" }}>
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <div style={{ marginLeft:"1%", display:"flex", alignItems:"center", flexShrink:0 }}>
            <ThemeToggle />
          </div>
        </div>

        {/* Row 2: Search */}
        <div style={{ padding:"0 12px 12px" }}>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Open search"
            className="mobile-search-trigger"
            style={{
              display:"flex",
              width:"100%",
              height:"42px",
              alignItems:"center",
              gap:"10px",
              borderRadius:"10px",
              border:"1px solid var(--accent, #ff9f00)",
              backgroundColor:"var(--input-bg, #2a2a2a)",
              color:"var(--text-secondary)",
              padding:"0 16px",
              textAlign:"left",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span style={{ flex:1, fontSize:"13.5px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {query || "Search products, brands and more..."}
            </span>
          </button>
        </div>

        {/* Row 3: mobile equivalent of the desktop category navigation */}
        <nav className="mobile-category-nav" aria-label="Product categories">
          {[{ label: 'All', path: PATHS.PRODUCTS }, ...NAV_LINKS].map((link) => {
            const linkCategory = link.path.split('?')[1] ? new URLSearchParams(link.path.split('?')[1]).get('category') : null;
            const isActive = link.label === 'All'
              ? (location.pathname === PATHS.HOME || (location.pathname === PATHS.PRODUCTS && !searchParams.get('category')))
              : linkCategory ? location.pathname === PATHS.PRODUCTS && searchParams.get('category') === linkCategory : false;

            return (
              <Link key={link.label} to={link.path} className={`mobile-category-nav__item${isActive ? ' mobile-category-nav__item--active' : ''}`}>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ══ MOBILE HAMBURGER DRAWER ══ */}
      {mobileMenuOpen && (
        <>
          <div onClick={closeMobileMenu}
            style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.55)", zIndex:998, opacity: mobileMenuVisible ? 1 : 0, transition:"opacity 220ms ease" }} />
          <div
            onTouchStart={handleMenuTouchStart}
            onTouchMove={handleMenuTouchMove}
            onTouchEnd={handleMenuTouchEnd}
            onTouchCancel={handleMenuTouchEnd}
            style={{
            position:"fixed", top:0, left:0, width:"78vw", maxWidth:"300px", height:"100dvh",
            backgroundColor:"var(--modal-bg, #1c1c1c)", zIndex:999, overflowY:"auto", padding:"0 0 24px",
            transform: menuDragging ? `translateX(${menuDragX}px)` : (mobileMenuVisible ? "translateX(0)" : "translateX(-100%)"),
            transition: menuDragging ? "none" : "transform 220ms ease",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", backgroundColor:"var(--navbar-bg)", marginBottom:"8px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:"2px", minWidth:0 }}>
                {user ? (
                  <span style={{ fontSize:"16px", fontWeight:700, color:"#fff" }}>
                    Hello, {displayName}
                  </span>
                ) : (
                  <Link to={PATHS.LOGIN} onClick={closeMobileMenu}
                    style={{ fontSize:"16px", fontWeight:700, color:"#fff", textDecoration:"none", width:"fit-content" }}>
                    Hello, Sign In
                  </Link>
                )}
                {user && (
                  <Link to={PATHS.PROFILE} onClick={closeMobileMenu}
                    style={{ fontSize:"12px", color:"var(--text-secondary, #94a3b8)", textDecoration:"none", width:"fit-content" }}>
                    Manage your account
                  </Link>
                )}
              </div>
              <button onClick={closeMobileMenu} aria-label="Close menu"
                style={{
                  background:"rgba(255,255,255,0.05)", border:"none", cursor:"pointer", color:"#fff",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  width:"30px", height:"30px", borderRadius:"9999px", flexShrink:0,
                  transition:"background-color 220ms ease",
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            {[
              {
                label:"Home", path: PATHS.HOME,
                icon: <path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z" />,
              },
              {
                label:"My Orders", path: PATHS.ORDERS,
                icon: <><path d="M6 3h12a2 2 0 0 1 2 2v16H4V5a2 2 0 0 1 2-2Z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
              },
              {
                label:"Profile", path: PATHS.PROFILE,
                icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
              },
              {
                label: `Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ''}`, path: PATHS.WISHLIST,
                icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />,
              },
              {
                label: `Cart${totalItems > 0 ? ` (${totalItems})` : ''}`, path: PATHS.CART,
                icon: <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />,
              },
              { label:"Today's Deals",  path: PATHS.PRODUCTS },
              { label:"Electronics",    path: `${PATHS.PRODUCTS}?category=Electronics` },
              { label:"Fashion",        path: `${PATHS.PRODUCTS}?category=Clothing` },
              { label:"Home & Kitchen", path: `${PATHS.PRODUCTS}?category=Home` },
              { label:"Books",          path: `${PATHS.PRODUCTS}?category=Books` },
              { label:"Sports",         path: `${PATHS.PRODUCTS}?category=Sports` },
              {
                label:"Customer Service", path: PATHS.CUSTOMER_SERVICE,
                icon: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.32c-.66.27-1.4.9-1.4 1.68v.3" /><line x1="12" y1="17" x2="12" y2="17.01" /></>,
              },
            ].map((item) => {
              const [itemPath, itemQuery] = item.path.split('?');
              const itemCategory = itemQuery ? new URLSearchParams(itemQuery).get('category') : null;
              const isActive = itemCategory
                ? location.pathname === PATHS.PRODUCTS && searchParams.get('category') === itemCategory
                : location.pathname === itemPath;

              return (
                <Link key={item.label} to={item.path} onClick={closeMobileMenu}
                  style={{
                    display:"flex", alignItems:"center", gap:"12px", minHeight:"54px", padding:"0 20px",
                    fontSize:"15px", fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--accent, #ff9f00)" : "var(--text-primary, #e2e8f0)",
                    backgroundColor: isActive ? "rgba(255,159,0,0.08)" : "transparent",
                    textDecoration:"none",
                    borderBottom:"1px solid rgba(255,255,255,0.06)",
                    transition:"background-color 220ms ease",
                  }}
                  onMouseEnter={(e)=>{ if (!isActive) e.currentTarget.style.backgroundColor="var(--hover-bg)"; }}
                  onMouseLeave={(e)=>{ if (!isActive) e.currentTarget.style.backgroundColor="transparent"; }}
                >
                  {item.icon && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke={isActive ? "var(--accent, #ff9f00)" : "var(--text-secondary, #94a3b8)"}
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
                      {item.icon}
                    </svg>
                  )}
                  {item.label}
                </Link>
              );
            })}
            {user && (
              <>
                <hr style={{ borderColor:"rgba(255,255,255,0.06)", margin:"8px 0" }} />
                <button onClick={()=>{ closeMobileMenu(); handleLogout(); }}
                  style={{ display:"flex", alignItems:"center", width:"100%", minHeight:"54px", textAlign:"left", padding:"0 20px", fontSize:"15px", color:"#f87171", background:"none", border:"none", cursor:"pointer" }}>Sign Out</button>
              </>
            )}
          </div>
        </>
      )}

      {mobileSearchOpen && (
        <SearchOverlayMobile
          initialValue={query}
          onSearch={handleSearch}
          onClose={() => setMobileSearchOpen(false)}
        />
      )}

      {/* ══ MORE — RIGHT-SIDE DRAWER ══ */}
      {drawerOpen && (
        <>
          <div onClick={closeDrawer}
            style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.5)", zIndex:1000, opacity: drawerVisible ? 1 : 0, transition:"opacity 240ms ease" }} />
          <div style={{
            position:"fixed", top:0, right:0, width:"72vw", maxWidth:"280px", height:"100dvh",
            backgroundColor:"var(--modal-bg, #1c1c1c)", zIndex:1001, display:"flex", flexDirection:"column",
            boxShadow:"-4px 0 24px rgba(0,0,0,0.4)",
            transform: drawerVisible ? "translateX(0)" : "translateX(100%)",
            transition:"transform 260ms cubic-bezier(0.32,0.72,0,1)",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px 14px", borderBottom:"1px solid var(--border-color, rgba(255,255,255,0.08))", flexShrink:0 }}>
              <span style={{ fontSize:"15px", fontWeight:600, color:"var(--text-primary, #e2e8f0)" }}>All Categories</span>
              <button onClick={closeDrawer} aria-label="Close categories"
                style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted, #94a3b8)", display:"flex", padding:"2px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <nav style={{ flex:1, overflowY:"auto" }}>
              {MORE_CATS.map((cat, idx) => (
                <Link key={cat.label} to={cat.path} onClick={closeDrawer}
                  style={{
                    display:"block", padding:"15px 20px", fontSize:"14px", fontWeight:400,
                    color:"var(--text-primary, #e2e8f0)", textDecoration:"none",
                    borderBottom: idx < MORE_CATS.length - 1 ? "1px solid var(--border-color, rgba(255,255,255,0.07))" : "none",
                    transition:"background 0.14s",
                  }}
                  onMouseEnter={(e)=>e.currentTarget.style.backgroundColor="var(--hover-bg)"}
                  onMouseLeave={(e)=>e.currentTarget.style.backgroundColor=""}
                  onTouchStart={(e)=>e.currentTarget.style.backgroundColor="var(--hover-bg)"}
                  onTouchEnd={(e)=>e.currentTarget.style.backgroundColor=""}
                >{cat.label}</Link>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* ══ DESKTOP CATEGORY BAR ══
          Dropdown panels use position:"fixed" (computed from the trigger's
          getBoundingClientRect on hover) instead of CSS group-hover +
          position:absolute. The row below needs overflowX:"auto" for
          horizontal scroll on narrower desktop widths, but per the CSS
          overflow spec that forces overflowY to compute as "auto" too —
          silently clipping any dropdown that would render below the row.
          position:"fixed" escapes that clipping entirely since it's
          positioned against the viewport, not the scrolling ancestor. */}
      <div className="hidden md:block" style={{ backgroundColor:"color-mix(in srgb, var(--navbar-bg) 93%, white 6%)", borderBottom:"1px solid rgba(255,255,255,0.08)", boxShadow:"0 2px 6px rgba(0,0,0,0.15)" }}>
        <div className="container-app"
          style={{ display:"flex", alignItems:"center", overflowX:"auto", whiteSpace:"nowrap", scrollbarWidth:"none", msOverflowStyle:"none", gap:"7px", minHeight:"46px", maxWidth:"1344px" }}>
          <div
            style={{ flexShrink:0 }}
            onMouseEnter={(e)=>openCategoryMenu("all", e.currentTarget)}
            onMouseLeave={closeCategoryMenu}>
            <Link to={PATHS.PRODUCTS}
              style={{ display:"flex", flexShrink:0, alignItems:"center", gap:"6px", border:"1px solid transparent", padding:"10px 10px", fontSize:"14px", fontWeight:700, color:"#fff", textDecoration:"none", transition:"border-color 0.15s", borderRadius:"2px" }}
              onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
              onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 20 20" style={{ transform: "scale(0.98)" }}>
                <path fillRule="evenodd" d="M3 5h14a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2zm0 4h14a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2zm0 4h14a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2z" clipRule="evenodd" />
              </svg>
              All Categories
            </Link>
            {categoryMenuOpen === "all" && (
              <div className="grid"
                style={{ position:"fixed", left: categoryMenuPos.left, top: categoryMenuPos.top, gridTemplateColumns:"repeat(4, 180px)", gap:"0", backgroundColor:"var(--modal-bg,#fff)", border:"1px solid var(--border-color,#ddd)", borderRadius:"4px", boxShadow:"0 4px 16px rgba(0,0,0,0.18)", zIndex:9999 }}>
                {CATEGORY_GROUPS.map((group, i) => (
                  <div key={group.title} style={{ padding:"14px 16px", borderLeft: i > 0 ? "1px solid var(--border-color,#eee)" : "none" }}>
                    <Link to={group.link}
                      style={{ display:"block", marginBottom:"8px", fontSize:"13px", fontWeight:800, textTransform:"uppercase", letterSpacing:"0.02em", color:"var(--text-primary)", textDecoration:"none" }}
                      onMouseEnter={(e)=>e.currentTarget.style.color="var(--accent,#ff9f00)"}
                      onMouseLeave={(e)=>e.currentTarget.style.color="var(--text-primary)"}>
                      {group.title}
                    </Link>
                    {group.items.map((item) => (
                      <Link key={item.label} to={item.link}
                        style={{ display:"block", padding:"6px 0", fontSize:"13.5px", color:"var(--text-secondary)", textDecoration:"none" }}
                        onMouseEnter={(e)=>e.currentTarget.style.color="var(--text-primary)"}
                        onMouseLeave={(e)=>e.currentTarget.style.color="var(--text-secondary)"}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          {NAV_LINKS.map((link) =>
            link.dropdown ? (
              <div key={link.label}
                style={{ flexShrink:0 }}
                onMouseEnter={(e)=>openCategoryMenu(link.label, e.currentTarget)}
                onMouseLeave={closeCategoryMenu}>
                <Link to={link.path}
                  style={{ display:"flex", alignItems:"center", gap:"4px", border:"1px solid transparent", padding:"10px 10px", fontSize:"14.5px", fontWeight:600, color:"#fff", textDecoration:"none", transition:"border-color 0.15s", borderRadius:"2px" }}
                  onMouseEnter={(e)=>e.currentTarget.style.borderColor="#fff"}
                  onMouseLeave={(e)=>e.currentTarget.style.borderColor="transparent"}>
                  {link.label}
                  <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20" style={{ transform: "scale(0.98)" }}>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </Link>
                {categoryMenuOpen === link.label && (
                  <div style={{ position:"fixed", left: categoryMenuPos.left, top: categoryMenuPos.top, minWidth:"160px", backgroundColor:"var(--modal-bg,#fff)", border:"1px solid var(--border-color,#ddd)", borderRadius:"4px", boxShadow:"0 4px 16px rgba(0,0,0,0.18)", zIndex:9999 }}>
                    {link.dropdown.map((item) => (
                      <Link key={item.label}
                        to={item.sub ? `${PATHS.PRODUCTS}?category=Clothing&subcategory=${item.sub}` : `${PATHS.PRODUCTS}?category=Clothing`}
                        style={{ display:"block", padding:"9px 16px", fontSize:"14px", color:"var(--text-primary)", textDecoration:"none" }}
                        onMouseEnter={(e)=>e.currentTarget.style.background="var(--hover-bg)"}
                        onMouseLeave={(e)=>e.currentTarget.style.background=""}>{item.label}</Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link key={link.label} to={link.path}
                style={{ display:"flex", flexShrink:0, border:"1px solid transparent", padding:"10px 10px", fontSize:"14.5px", fontWeight:600, color:"#fff", textDecoration:"none", transition:"border-color 0.15s", borderRadius:"2px" }}
                onMouseEnter={(e)=>e.currentTarget.style.borderColor="#fff"}
                onMouseLeave={(e)=>e.currentTarget.style.borderColor="transparent"}
              >{link.label}</Link>
            )
          )}
        </div>
      </div>

    </header>
  );
}

export default Navbar;
