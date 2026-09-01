import api from "@/api/api";
import { API_ENDPOINTS } from "@/api/apiEndpoints";

/**
 * Normalizes backend responses so every list endpoint always returns an array.
 */
const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

// CUSTOMER ENDPOINTS (READ ONLY)

// GET /api/products
export const getAllProducts = async () => {
  const { data } = await api.get(API_ENDPOINTS.PRODUCTS);
  return unwrapList(data);
};

// GET /api/products/:id
export const getProductById = async (id) => {
  const { data } = await api.get(`${API_ENDPOINTS.PRODUCTS}/${id}`);
  return data;
};

// GET /api/products/featured
export const getFeaturedProducts = async () => {
  const { data } = await api.get(`${API_ENDPOINTS.PRODUCTS}/featured`);
  return unwrapList(data);
};

// GET /api/products/category/:category
export const getProductsByCategory = async (category) => {
  const { data } = await api.get(
    `${API_ENDPOINTS.PRODUCTS}/category/${category}`
  );
  return unwrapList(data);
};

// GET /api/products/category/:category/subcategory/:sub
export const getProductsByCategoryAndSubcategory = async (
  category,
  subcategory
) => {
  const { data } = await api.get(
    `${API_ENDPOINTS.PRODUCTS}/category/${category}/subcategory/${subcategory}`
  );
  return unwrapList(data);
};

// GET /api/products/subcategory/:sub
export const getProductsBySubcategory = async (subcategory) => {
  const { data } = await api.get(
    `${API_ENDPOINTS.PRODUCTS}/subcategory/${subcategory}`
  );
  return unwrapList(data);
};

// GET /api/products/brand/:brand
export const getProductsByBrand = async (brand) => {
  const { data } = await api.get(
    `${API_ENDPOINTS.PRODUCTS}/brand/${brand}`
  );
  return unwrapList(data);
};

// GET /api/products/search?keyword=...&page=&size=
// Search is paginated, so keep the response object intact.
export const searchProducts = async (keyword, page = 0, size = 20) => {
  const { data } = await api.get(
    `${API_ENDPOINTS.PRODUCTS}/search`,
    {
      params: { keyword, page, size },
    }
  );
  return data;
};

// GET /api/products/price?min=&max=
export const getProductsByPriceRange = async (min, max) => {
  const { data } = await api.get(
    `${API_ENDPOINTS.PRODUCTS}/price`,
    {
      params: { min, max },
    }
  );
  return unwrapList(data);
};

// ADMIN ENDPOINTS (WRITE / UPDATE / DELETE)

// POST /api/products
export const createProduct = async (productData) => {
  const { data } = await api.post(
    API_ENDPOINTS.PRODUCTS,
    productData
  );
  return data;
};

// PUT /api/products/:id
export const updateProduct = async (id, updateData) => {
  const { data } = await api.put(
    `${API_ENDPOINTS.PRODUCTS}/${id}`,
    updateData
  );
  return data;
};

// PATCH /api/products/:id/featured?featured=true
export const toggleFeaturedStatus = async (id, isFeatured) => {
  const { data } = await api.patch(
    `${API_ENDPOINTS.PRODUCTS}/${id}/featured`,
    null,
    {
      params: { featured: isFeatured },
    }
  );
  return data;
};

// DELETE /api/products/:id
export const deleteProduct = async (id) => {
  const { data } = await api.delete(
    `${API_ENDPOINTS.PRODUCTS}/${id}`
  );
  return data;
};

// GET /api/products/search?keyword=...&page=0&size=6
// Reuses the search endpoint (rather than /products/suggestions) because the
// typeahead dropdown needs price, and the dedicated suggestions endpoint only
// returns id/name/category/imageUrl.
export const getProductSuggestions = async (q) => {
  const { data } = await api.get(
    `${API_ENDPOINTS.PRODUCTS}/search`,
    {
      params: { keyword: q, page: 0, size: 6 },
    }
  );
  return unwrapList(data);
};