import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import PATHS from "@/routes/paths";
import { useCartQuery } from "@/features/cart/hooks/useCart";
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

// ── Mobile "Shop By" — 4 visible categories + More button ────────────────────
const MOBILE_PRIMARY = [
  {
    label: "Deals",
    path: PATHS.PRODUCTS,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    label: "Mobiles",
    path: `${PATHS.PRODUCTS}?category=Electronics&subcategory=Mobile`,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
  },
  {
    label: "Fashion",
    path: `${PATHS.PRODUCTS}?category=Clothing`,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
      </svg>
    ),
  },
  {
    label: "Electronics",
    path: `${PATHS.PRODUCTS}?category=Electronics`,
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
];

// ── "More" drawer — includes Home & Kitchen + all other categories ───────────
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

// ── Shared desktop nav-item style ─────────────────────────────────────────────
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

/**
 * useGuestWishlistCount
 *
 * Returns the live count of items in the guest (LocalStorage) wishlist.
 * Subscribes to both:
 *   - "guestWishlistUpdated" (custom event fired by guestWishlistService after
 *     every add/remove/clear so the badge updates on the same tab immediately)
 *   - native "storage" event (fires when a different browser tab changes
 *     localStorage so multi-tab guests stay in sync)
 */
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
  const cartItems                    = cartData?.items ?? [];
  const totalItems                   = cartItems.reduce((sum, i) => sum + (i.quantity ?? 0), 0);

  // ── Wishlist count: MongoDB for logged-in users, LocalStorage for guests ──
  const { data: wishlistItems = [] }  = useWishlistQuery();
  const guestWishlistCount            = useGuestWishlistCount();
  const { user, logout }             = useAuth();
  // If user is logged in, count from backend; otherwise count from LocalStorage
  const wishlistCount                = user ? wishlistItems.length : guestWishlistCount;

  const showToast                    = useToastStore((state) => state.showToast);
  const navigate                     = useNavigate();
  const [searchParams]               = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const query = searchParams.get("search") || "";

  useEffect(() => {
    if (drawerOpen) {
      requestAnimationFrame(() => setDrawerVisible(true));
    } else {
      setDrawerVisible(false);
    }
  }, [drawerOpen]);

  const openDrawer  = () => setDrawerOpen(true);
  const closeDrawer = () => {
    setDrawerVisible(false);
    setTimeout(() => setDrawerOpen(false), 260);
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
      <div className="hidden md:block" style={{ backgroundColor: "var(--navbar-bg)", minHeight: "68px" }}>
        <div style={{ maxWidth:"1282px", margin:"0 auto", padding:"0 19px", height:"68px", display:"flex", alignItems:"center", gap:"11px" }}>
          <Link to={PATHS.HOME} aria-label="ShopApp Home"
            style={{ ...navItemBase, flexDirection:"column", alignItems:"flex-start", padding:"4px 7px 4px 13px", minWidth:"150px", flexShrink:0 }}
            onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
            onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
            <span style={{ fontSize:"22.5px", fontWeight:800, color:"#fff", lineHeight:1.2, letterSpacing:"-0.4px" }}>
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
            inputClassName="px-4 py-2 text-[14px]"
            inputStyle={{ color: "#0f1111" }}
            buttonClassName="flex w-[62px] self-stretch items-center justify-center"
            buttonStyle={{ backgroundColor: "var(--accent, #ff9f00)", color: "#0f1111" }}
          />

          <div style={{ display:"flex", alignItems:"center", gap:"5.5px", flexShrink:0 }}>
            {user ? (
              <div className="group" style={{ position:"relative" }}>
                <div style={{ ...navItemBase, flexDirection:"column", alignItems:"flex-start", padding:"4px 11px" }}
                  onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
                  onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
                  <span style={{ fontSize:"11.5px", color:"#cbd5e1", lineHeight:1.4 }}>Hello, {displayName}</span>
                  <span style={{ fontSize:"14px", fontWeight:700, color:"#fff", lineHeight:1.4 }}>Account</span>
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
                <span style={{ fontSize:"14px", fontWeight:700, color:"#fff", lineHeight:1.4 }}>Account &amp; Lists</span>
              </Link>
            )}
            <Link to={PATHS.ORDERS} style={{ ...navItemBase, flexDirection:"column", alignItems:"flex-start", padding:"4px 10px" }}
              onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
              onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
              <span style={{ fontSize:"11px", color:"#cbd5e1", lineHeight:1.4 }}>Returns</span>
              <span style={{ fontSize:"14px", fontWeight:700, color:"#fff", lineHeight:1.4 }}>&amp; Orders</span>
            </Link>
            <Link to={PATHS.WISHLIST} aria-label="Wishlist" style={{ ...navItemBase, gap:"6px", padding:"4px 10px" }}
              onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
              onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
              <div style={{ position:"relative", display:"flex" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                {wishlistCount > 0 && (
                  <span style={{ position:"absolute", top:"-5px", left:"14px", minWidth:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"9999px", fontSize:"10px", fontWeight:800, backgroundColor:"var(--accent,#ff9f00)", color:"#0f1111", padding:"0 3px" }}>
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize:"14px", fontWeight:700, color:"#fff", marginBottom:"2px" }}>Wishlist</span>
            </Link>
            <Link to={PATHS.CART} aria-label="Cart" style={{ ...navItemBase, gap:"6px", padding:"4px 10px" }}
              onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
              onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
              <div style={{ position:"relative", display:"flex" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {totalItems > 0 && (
                  <span style={{ position:"absolute", top:"-5px", left:"14px", minWidth:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"9999px", fontSize:"10px", fontWeight:800, backgroundColor:"var(--accent,#ff9f00)", color:"#0f1111", padding:"0 3px" }}>
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>
              <span style={{ fontSize:"14px", fontWeight:700, color:"#fff", marginBottom:"2px" }}>Cart</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ══ MOBILE NAVBAR ══ */}
      <div className="md:hidden" style={{ backgroundColor: "var(--navbar-bg)" }}>

        {/* Row 1: Hamburger · Logo · spacer · Account · Cart · ThemeToggle */}
        <div style={{ display:"flex", alignItems:"center", padding:"10px 14px", gap:"10px" }}>
          <button aria-label="Open menu" onClick={()=>setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", flexShrink:0, display:"flex", alignItems:"center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
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
            <Link to={PATHS.PROFILE} style={{ display:"flex", alignItems:"center", gap:"4px", textDecoration:"none", flexShrink:0 }}>
              <span style={{ fontSize:"13px", fontWeight:600, color:"#fff" }}>{displayName}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          ) : (
            <Link to={PATHS.LOGIN} style={{ textDecoration:"none", flexShrink:0 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          )}
          {/* Mobile wishlist icon with badge */}
          <Link to={PATHS.WISHLIST} aria-label="Wishlist" style={{ position:"relative", display:"flex", alignItems:"center", textDecoration:"none", flexShrink:0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
            {wishlistCount > 0 && (
              <span style={{ position:"absolute", top:"-6px", right:"-6px", minWidth:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"9999px", fontSize:"10px", fontWeight:800, backgroundColor:"var(--accent,#ff9f00)", color:"#0f1111", padding:"0 3px" }}>
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </span>
            )}
          </Link>
          <Link to={PATHS.CART} aria-label="Cart" style={{ position:"relative", display:"flex", alignItems:"center", textDecoration:"none", flexShrink:0 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            {totalItems > 0 && (
              <span style={{ position:"absolute", top:"-6px", right:"-6px", minWidth:"18px", height:"18px", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"9999px", fontSize:"10px", fontWeight:800, backgroundColor:"var(--accent,#ff9f00)", color:"#0f1111", padding:"0 3px" }}>
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <ThemeToggle />
        </div>

        {/* Row 2: Search */}
        <div style={{ padding:"0 14px 10px" }}>
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            aria-label="Open search"
            style={{
              display:"flex",
              width:"100%",
              alignItems:"center",
              gap:"10px",
              borderRadius:"8px",
              border:"2px solid var(--accent, #ff9f00)",
              backgroundColor:"var(--input-bg, #2a2a2a)",
              color:"var(--text-secondary)",
              padding:"12px 16px",
              textAlign:"left",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
              {query || "Search products, brands and more..."}
            </span>
          </button>
        </div>

        {/* ══ Row 3: Shop By — 5 items (Icon Top, Label Bottom) ══ */}
        <div style={{
          backgroundColor: "var(--navbar-bg)",
          padding: "8px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <p style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "#9ca3af",
            marginBottom: "10px",
            lineHeight: 1,
          }}>Shop By</p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            alignItems: "center",
            justifyItems: "center",
            width: "100%",
          }}>
            {MOBILE_PRIMARY.map((cat) => (
              <Link
                key={cat.label}
                to={cat.path}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  textDecoration: "none",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span style={{ color: "#e2e8f0", display: "flex" }}>
                  {cat.icon}
                </span>
                <span style={{
                  fontSize: "12px",
                  fontWeight: 400,
                  color: "#F3F4F6",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}>
                  {cat.label}
                </span>
              </Link>
            ))}

            <button
              onClick={openDrawer}
              aria-label="More categories"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ color: "#e2e8f0", display: "flex" }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="currentColor">
                  <circle cx="5"  cy="5"  r="2.2"/>
                  <circle cx="13" cy="5"  r="2.2"/>
                  <circle cx="21" cy="5"  r="2.2"/>
                  <circle cx="5"  cy="13" r="2.2"/>
                  <circle cx="13" cy="13" r="2.2"/>
                  <circle cx="21" cy="13" r="2.2"/>
                  <circle cx="5"  cy="21" r="2.2"/>
                  <circle cx="13" cy="21" r="2.2"/>
                  <circle cx="21" cy="21" r="2.2"/>
                </svg>
              </span>
              <span style={{ fontSize: "12px", fontWeight: 400, color: "#F3F4F6", whiteSpace: "nowrap" }}>More</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══ MOBILE HAMBURGER DRAWER ══ */}
      {mobileMenuOpen && (
        <>
          <div onClick={()=>setMobileMenuOpen(false)}
            style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.55)", zIndex:998 }} />
          <div style={{ position:"fixed", top:0, left:0, width:"78vw", maxWidth:"300px", height:"100dvh", backgroundColor:"var(--modal-bg, #1c1c1c)", zIndex:999, overflowY:"auto", padding:"0 0 24px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px", backgroundColor:"var(--navbar-bg)", marginBottom:"8px" }}>
              <span style={{ fontSize:"16px", fontWeight:700, color:"#fff" }}>
                {user ? `Hello, ${displayName}` : "Hello, Sign In"}
              </span>
              <button onClick={()=>setMobileMenuOpen(false)} aria-label="Close menu"
                style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", display:"flex" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            {[
              { label:"Home",           path: PATHS.HOME },
              { label:"My Orders",      path: PATHS.ORDERS },
              { label:"Profile",        path: PATHS.PROFILE },
              { label: `Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ''}`, path: PATHS.WISHLIST },
              { label:"Cart",           path: PATHS.CART },
              { label:"Today's Deals",  path: PATHS.PRODUCTS },
              { label:"Electronics",    path: `${PATHS.PRODUCTS}?category=Electronics` },
              { label:"Fashion",        path: `${PATHS.PRODUCTS}?category=Clothing` },
              { label:"Home & Kitchen", path: `${PATHS.PRODUCTS}?category=Home` },
              { label:"Books",          path: `${PATHS.PRODUCTS}?category=Books` },
              { label:"Sports",         path: `${PATHS.PRODUCTS}?category=Sports` },
              { label:"Customer Service", path: PATHS.CUSTOMER_SERVICE },
            ].map((item) => (
              <Link key={item.label} to={item.path} onClick={()=>setMobileMenuOpen(false)}
                style={{ display:"block", padding:"13px 20px", fontSize:"15px", color:"var(--text-primary, #e2e8f0)", textDecoration:"none", borderBottom:"1px solid var(--border-color, rgba(255,255,255,0.07))" }}
                onMouseEnter={(e)=>e.currentTarget.style.backgroundColor="var(--hover-bg)"}
                onMouseLeave={(e)=>e.currentTarget.style.backgroundColor=""}>{item.label}</Link>
            ))}
            {user && (
              <>
                <hr style={{ borderColor:"var(--border-color, rgba(255,255,255,0.1))", margin:"8px 0" }} />
                <button onClick={()=>{ setMobileMenuOpen(false); handleLogout(); }}
                  style={{ display:"block", width:"100%", textAlign:"left", padding:"13px 20px", fontSize:"15px", color:"#f87171", background:"none", border:"none", cursor:"pointer" }}>Sign Out</button>
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

      {/* ══ DESKTOP CATEGORY BAR ══ */}
      <div className="hidden md:block" style={{ backgroundColor:"color-mix(in srgb, var(--navbar-bg) 93%, white 6%)" }}>
        <div className="container-app"
          style={{ display:"flex", alignItems:"center", overflowX:"auto", whiteSpace:"nowrap", scrollbarWidth:"none", msOverflowStyle:"none", gap:0, minHeight:"40px" }}>
          <Link to={PATHS.PRODUCTS}
            style={{ display:"flex", flexShrink:0, alignItems:"center", gap:"6px", border:"1px solid transparent", padding:"8px 12px", fontSize:"14px", fontWeight:700, color:"#fff", textDecoration:"none", transition:"border-color 0.15s", borderRadius:"2px" }}
            onMouseEnter={(e)=>(e.currentTarget.style.borderColor="#fff")}
            onMouseLeave={(e)=>(e.currentTarget.style.borderColor="transparent")}>
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5h14a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2zm0 4h14a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2zm0 4h14a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2z" clipRule="evenodd" />
            </svg>
            All
          </Link>
          {NAV_LINKS.map((link) =>
            link.dropdown ? (
              <div key={link.label} className="group" style={{ position:"relative", flexShrink:0 }}>
                <Link to={link.path}
                  style={{ display:"flex", alignItems:"center", gap:"4px", border:"1px solid transparent", padding:"8px 12px", fontSize:"14.5px", fontWeight:500, color:"#fff", textDecoration:"none", transition:"border-color 0.15s", borderRadius:"2px" }}
                  onMouseEnter={(e)=>e.currentTarget.style.borderColor="#fff"}
                  onMouseLeave={(e)=>e.currentTarget.style.borderColor="transparent"}>
                  {link.label}
                  <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </Link>
                <div className="hidden group-hover:block"
                  style={{ position:"absolute", top:"100%", left:0, minWidth:"160px", backgroundColor:"var(--modal-bg,#fff)", border:"1px solid var(--border-color,#ddd)", borderRadius:"4px", boxShadow:"0 4px 16px rgba(0,0,0,0.18)", zIndex:9999 }}>
                  {link.dropdown.map((item) => (
                    <Link key={item.label}
                      to={item.sub ? `${PATHS.PRODUCTS}?category=Clothing&subcategory=${item.sub}` : `${PATHS.PRODUCTS}?category=Clothing`}
                      style={{ display:"block", padding:"9px 16px", fontSize:"14px", color:"var(--text-primary)", textDecoration:"none" }}
                      onMouseEnter={(e)=>e.currentTarget.style.background="var(--hover-bg)"}
                      onMouseLeave={(e)=>e.currentTarget.style.background=""}>{item.label}</Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={link.label} to={link.path}
                style={{ display:"flex", flexShrink:0, border:"1px solid transparent", padding:"8px 12px", fontSize:"14.5px", fontWeight:500, color:"#fff", textDecoration:"none", transition:"border-color 0.15s", borderRadius:"2px" }}
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
