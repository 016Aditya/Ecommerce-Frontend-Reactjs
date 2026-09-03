import PATHS from '@/routes/paths';
import { useTodaysDeals } from '@/features/home/hooks/useTodaysDeals';
import ProductRail from './ProductRail';

function TodaysDeals() {
  const { products, loading, error } = useTodaysDeals(8);

  return (
    <ProductRail
      title="Today's Deals"
      subtitle="Our biggest discounts right now."
      products={products}
      loading={loading}
      error={error}
      browseAllPath={PATHS.PRODUCTS}
      emptyMessage="No active deals right now — check back soon."
    />
  );
}

export default TodaysDeals;
