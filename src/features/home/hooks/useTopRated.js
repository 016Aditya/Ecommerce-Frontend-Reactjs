import { useMemo } from 'react';
import { useAllProductsQuery } from '@/hooks/useQueryProducts';

// Top Rated — sorted by real averageRating (tie-broken by reviewCount).
// Only includes products with at least one review so an unrated product
// can't outrank genuinely reviewed ones by sorting ties arbitrarily.
export const useTopRated = (limit = 8) => {
  const { data, isLoading, isError, error } = useAllProductsQuery();

  const products = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .filter((product) => (product.reviewCount ?? 0) > 0)
      .sort((a, b) => {
        const ratingDiff = (b.averageRating ?? 0) - (a.averageRating ?? 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
      })
      .slice(0, limit);
  }, [data, limit]);

  return {
    products,
    loading: isLoading,
    error: isError ? (error?.message ?? 'Failed to load top rated products') : null,
  };
};
