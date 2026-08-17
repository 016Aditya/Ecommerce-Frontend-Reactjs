// API Base URL
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// NOTE: API_ENDPOINTS and ADDRESSES are defined in src/api/apiEndpoints.js
// Do NOT duplicate them here. Import from '@/api/apiEndpoints' in services.

// Auth
export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const LOCAL_STORAGE_KEYS = {
  USER: "user",
};

// Order statuses - must match your backend Order entity exactly
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

// Label map for displaying status in the UI
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.SHIPPED]: "Shipped",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

// Color classes (Tailwind) per status
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [ORDER_STATUS.CONFIRMED]: "bg-blue-100 text-blue-800",
  [ORDER_STATUS.SHIPPED]: "bg-purple-100 text-purple-800",
  [ORDER_STATUS.DELIVERED]: "bg-green-100 text-green-800",
  [ORDER_STATUS.CANCELLED]: "bg-red-100 text-red-800",
};

// Product categories
export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Books",
  "Home & Kitchen",
  "Sports",
  "Beauty",
  "Toys",
  "Automotive",
];

// Review ratings
export const RATING_MIN = 1;
export const RATING_MAX = 5;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;

// Cart
export const MAX_CART_QUANTITY = 99;
export const MIN_CART_QUANTITY = 1;

// App routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  ORDER_DETAIL: "/orders/:id",
  PROFILE: "/profile",
  ADMIN: "/admin",
};

// Helper to build dynamic routes
export const buildRoute = {
  productDetail: (id) => `/products/${id}`,
  orderDetail: (id) => `/orders/${id}`,
};