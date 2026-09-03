import { useMemo } from 'react';
import { useAllProductsQuery } from '@/hooks/useQueryProducts';

const discountPercent = (product) =>
  product.originalPrice && product.originalPrice > product.price
    ? ((product.originalPrice - product.price) / product.originalPrice) * 100
    : 0;

// Today's Deals — real discounted products, sorted by biggest discount %.
// No fabricated countdown/urgency: the backend has no deal-expiry field,
// so this section only shows what's genuinely discounted right now.
export const useTodaysDeals = (limit = 8) => {
  const { data, isLoading, isError, error } = useAllProductsQuery();

  const products = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .filter((product) => discountPercent(product) > 0)
      .sort((a, b) => discountPercent(b) - discountPercent(a))
      .slice(0, limit);
  }, [data, limit]);

  return {
    products,
    loading: isLoading,
    error: isError ? (error?.message ?? 'Failed to load deals') : null,
  };
};
