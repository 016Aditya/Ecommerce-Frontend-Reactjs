import PATHS from '@/routes/paths';
import { useTopRated } from '@/features/home/hooks/useTopRated';
import ProductRail from './ProductRail';

function TopRated() {
  const { products, loading, error } = useTopRated(8);

  return (
    <ProductRail
      title="Top Rated"
      subtitle="Highest-rated products, chosen by shoppers."
      products={products}
      loading={loading}
      error={error}
      browseAllPath={PATHS.PRODUCTS}
      emptyMessage="No rated products yet — check back soon."
    />
  );
}

export default TopRated;
