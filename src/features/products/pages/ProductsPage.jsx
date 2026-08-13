import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useAllProductsQuery,
  useProductSearchQuery,
  useProductsByCategory,
  useProductsBySubcategory,
} from '@/hooks/useQueryProducts';
import ProductGrid from '../components/ProductGrid';
import ProductFilter from '../components/ProductFilter';
import SearchPagination from '../components/SearchPagination'; // <-- 1. NEW IMPORT
import SEO from '@/components/common/SEO';
import { useSEO } from '@/hooks/useSEO';
import { ProductCardSkeleton } from '@/components/skeleton';
import { prefetchProductDetailPage } from '@/utils/prefetch';
import { useProductSearchParams } from '../hooks/useProductSearchParams';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { search, page, setSearch, setPage } = useProductSearchParams();

  const activeCat    = searchParams.get('category')    ?? 'All';
  const activeSub    = searchParams.get('subcategory') ?? null;
  const activeSearch = search;
  const isSearchMode = activeSearch.trim().length >= 2;

  const searchResult = useProductSearchQuery(activeSearch, page);
  const subcategoryResult = useProductsBySubcategory(activeSub);
  const categoryResult = useProductsByCategory(activeCat);
  const allProductsResult = useAllProductsQuery();

  const activeResult = isSearchMode
    ? searchResult
    : activeSub
      ? subcategoryResult
      : activeCat !== 'All'
        ? categoryResult
        : allProductsResult;

  const { data, isLoading: loading, isError, error: queryError } = activeResult;
  const products = isSearchMode ? (data?.content ?? []) : (data ?? []);
  const error = isError ? (queryError?.message ?? 'Failed to load products') : null;
  const totalPages = isSearchMode ? (data?.totalPages ?? 0) : 0;
  const hasNext = isSearchMode ? Boolean(data?.hasNext) : false;
  const hasPrevious = isSearchMode ? Boolean(data?.hasPrevious) : false;

  // Generate SEO meta tags based on active filter
  const seoData = useMemo(() => {
    if (isSearchMode) {
      return {
        title: `Search Results for "${activeSearch}" | Shop Fashion`,
        description: `Find products matching "${activeSearch}". Shop the best deals on fashion, electronics, and more.`,
      };
    }
    
    if (activeSub) {
      return {
        title: `${activeSub} | Shop Fashion`,
        description: `Browse our collection of ${activeSub} in ${activeCat}. Shop quality products at the best prices.`,
      };
    }
    
    if (activeCat !== 'All') {
      return {
        title: `${activeCat} | Shop Fashion`,
        description: `Browse our collection of ${activeCat}. Find the latest trends and best deals on quality products.`,
      };
    }
    
    return {
      title: 'Products | Shop Fashion',
      description: 'Browse our complete collection of fashion, electronics, home & kitchen, and more. Find the best deals on quality products.',
    };
  }, [activeSearch, activeCat, activeSub, isSearchMode]);

  const { seoProps } = useSEO(seoData);

  // Stage 1: prefetch ProductDetail during idle time once the products list
  // is visible — very likely the user will click a product next.
  useEffect(() => {
    if (!loading && products.length > 0) {
      prefetchProductDetailPage();
    }
  }, [loading, products.length]);

  const handleClearSearch = useCallback(() => {
    if (activeSearch) {
      setSearch('');
      return;
    }
    if (activeSub) {
      setSearchParams(activeCat !== 'All' ? { category: activeCat } : {});
      return;
    }
    if (activeCat !== 'All') {
      setSearchParams({});
    }
  }, [activeSearch, activeSub, activeCat, setSearch, setSearchParams]);

  const handleCategorySelect = useCallback(
    (category) => {
      setSearchParams(category === 'All' ? {} : { category });
    },
    [setSearchParams]
  );

  const handleSubcategorySelect = useCallback(
    (sub) => {
      if (!sub) {
        setSearchParams(activeCat !== 'All' ? { category: activeCat } : {});
        return;
      }
      setSearchParams({ category: activeCat, subcategory: sub });
    },
    [activeCat, setSearchParams]
  );

  return (
    <section className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <SEO {...seoProps} />
      <div className="py-6" style={{ width: '100%', maxWidth: 'calc(100% - 48px)', marginInline: 'auto' }}>
        {(activeCat !== 'All' || activeSearch) && (
          <div
            className="mb-3 flex items-center gap-2 rounded-sm px-4 shadow-sm"
            style={{
              backgroundColor: 'var(--card-bg-elevated)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '15px',
              paddingBlock: '12px',
            }}
          >
            {activeSearch ? (
              <>
                <span className="font-semibold">Search:</span> &ldquo;{activeSearch}&rdquo;
              </>
            ) : (
              <>
                <span style={{ fontWeight: 700 }}>Category:</span>{' '}
                <span style={{ fontWeight: 600 }}>
                  {activeCat}
                  {activeSub ? ` > ${activeSub}` : ''}
                </span>
              </>
            )}
            <button
              onClick={handleClearSearch}
              className="ml-auto hover:underline"
              style={{ color: 'var(--info-text)', fontSize: '13px', fontWeight: 600 }}
            >
              Clear x
            </button>
          </div>
        )}

        <div
          className="mb-4 flex flex-col gap-3 rounded-sm px-4 shadow-sm"
          style={{
            backgroundColor: 'var(--card-bg-elevated)',
            border: '1px solid var(--border-color)',
            paddingBlock: '15px',
          }}
        >
          <ProductFilter
            activeCategory={activeCat}
            activeSubcategory={activeSub}
            onSelect={handleCategorySelect}
            onSubSelect={handleSubcategorySelect}
          />
        </div>

        {/* Skeleton grid */}
        {loading && (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <p
            className="rounded-sm p-4 text-sm shadow-sm"
            style={{
              backgroundColor: 'var(--error-bg)',
              color: 'var(--error-text)',
              border: '1px solid var(--error-border)',
            }}
          >
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="sk-loaded">
            <p className="mb-3 text-sm" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>

            <div style={{ paddingBottom: '24px' }}>
              <ProductGrid products={products} />
            </div>
            
            {/* 2. NEW CLEAN PAGINATION COMPONENT */}
            {isSearchMode && totalPages > 1 && (
              <SearchPagination 
                currentPage={page}
                totalPages={totalPages}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onPageChange={setPage}
              />
            )}
            
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsPage;
