import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation, useParams } from "react-router-dom";
import PATHS from "./paths";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";

import PageWrapper from "@/components/layout/PageWrapper";
import PageLoader from "@/components/skeleton/PageLoader";
import HomePage from "@/features/home/pages/HomePage";

const Login          = lazy(() => import("@/features/auth/pages/Login"));
const Register       = lazy(() => import("@/features/auth/pages/Register"));
const OAuth2Success  = lazy(() => import("@/features/auth/pages/OAuth2Success"));
const ForgotPassword = lazy(() => import("@/features/auth/pages/ForgotPassword"));
const ResetPassword  = lazy(() => import("@/features/auth/pages/ResetPassword"));

const ProductsPage        = lazy(() => import("@/features/products/pages/ProductsPage"));
const ProductDetailPage   = lazy(() => import("@/features/products/pages/ProductDetailPage"));
const CustomerServicePage = lazy(() => import("@/features/customerService/pages/CustomerServicePage"));
const WishlistPage        = lazy(() => import("@/features/wishlist/pages/WishlistPage"));

const CartPage         = lazy(() => import("@/features/cart/pages/CartPage"));
const CheckoutPage     = lazy(() => import("@/features/orders/pages/CheckoutPage"));
const OrdersPage       = lazy(() => import("@/features/orders/pages/OrdersPage"));
const OrderDetailPage  = lazy(() => import("@/features/orders/pages/OrderDetailPage"));
const OrderSuccessPage = lazy(() => import("@/features/orders/pages/OrderSuccessPage"));
const ProfilePage      = lazy(() => import("@/features/profile/pages/ProfilePage"));

const SavedAddresses = lazy(() => import("@/features/address/pages/SavedAddresses"));

const NotFound = lazy(() => import("@/errors/NotFound"));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const scrollRoot = document.scrollingElement || document.documentElement;
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      scrollRoot.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
  return null;
};

/**
 * KeyedProductDetail
 *
 * Keys the entire Suspense + ProductDetailPage subtree on :id so React
 * tears down and rebuilds on every id change, preventing stale param reads.
 */
const KeyedProductDetail = () => {
  const { id } = useParams();
  return (
    <Suspense key={id} fallback={<PageLoader />}>
      <ProductDetailPage />
    </Suspense>
  );
};

const AppRoutes = () => (
  <>
    <ScrollToTop />
    <Routes>
      {/* OAuth2 callback — no layout wrapper */}
      <Route
        path={PATHS.OAUTH2_SUCCESS}
        element={
          <Suspense fallback={null}>
            <OAuth2Success />
          </Suspense>
        }
      />

      {/* All other routes share PageWrapper (Navbar + Footer via Outlet) */}
      <Route element={<PageWrapper />}>

        {/* Public-only routes (redirect to home if already logged in) */}
        <Route element={<PublicRoute />}>
          <Route path={PATHS.LOGIN}           element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
          <Route path={PATHS.REGISTER}        element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />
          <Route path={PATHS.FORGOT_PASSWORD} element={<Suspense fallback={<PageLoader />}><ForgotPassword /></Suspense>} />
          <Route path={PATHS.RESET_PASSWORD}  element={<Suspense fallback={<PageLoader />}><ResetPassword /></Suspense>} />
        </Route>

        {/* Open routes — accessible by everyone including guests */}
        <Route path={PATHS.HOME}             element={<HomePage />} />
        <Route path={PATHS.PRODUCTS}         element={<Suspense fallback={<PageLoader />}><ProductsPage /></Suspense>} />
        <Route path={PATHS.PRODUCT_DETAIL}   element={<KeyedProductDetail />} />
        <Route path={PATHS.CUSTOMER_SERVICE} element={<Suspense fallback={<PageLoader />}><CustomerServicePage /></Suspense>} />

        {/*
          Wishlist is NOT inside PrivateRoute.
          WishlistPage handles its own auth branching internally:
            - Guest  → LocalStorage wishlist via GuestWishlistPanel
            - Auth   → MongoDB wishlist via AuthWishlistPanel
        */}
        <Route path={PATHS.WISHLIST} element={<Suspense fallback={<PageLoader />}><WishlistPage /></Suspense>} />

        {/*
          Cart is NOT inside PrivateRoute.
          CartPage handles its own auth branching internally:
            - Guest  → localStorage cart via guestCartService (full page)
            - Auth   → backend cart via TanStack Query
          Only the "Proceed to Checkout" button inside CartPage gates on auth.
        */}
        <Route path={PATHS.CART} element={<Suspense fallback={<PageLoader />}><CartPage /></Suspense>} />

        {/* Protected routes — require authentication */}
        <Route element={<PrivateRoute />}>
          <Route path={PATHS.CHECKOUT}        element={<Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense>} />
          <Route path={PATHS.ORDERS}          element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
          <Route path={PATHS.ORDER_DETAIL}    element={<Suspense fallback={<PageLoader />}><OrderDetailPage /></Suspense>} />
          <Route path={PATHS.ORDER_SUCCESS}   element={<Suspense fallback={<PageLoader />}><OrderSuccessPage /></Suspense>} />
          <Route path={PATHS.PROFILE}         element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
          <Route path={PATHS.SAVED_ADDRESSES} element={<Suspense fallback={<PageLoader />}><SavedAddresses /></Suspense>} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
      </Route>
    </Routes>
  </>
);

export default AppRoutes;
