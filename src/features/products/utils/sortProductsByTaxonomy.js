import { MEGA_MENU_GROUPS } from '@/constants/categoryTaxonomy';

const categoryOrder = new Map(MEGA_MENU_GROUPS.map((group, i) => [group.title, i]));
const subcategoryOrder = new Map(
  MEGA_MENU_GROUPS.flatMap((group) =>
    group.items.map((item, i) => [`${group.title}::${item.label}`, i])
  )
);

/**
 * Sorts products into the same category/subcategory order shown in the
 * Navbar "All Categories" mega menu, so the "All" products view reads as
 * grouped sections (Electronics, then Clothing, then Books...) instead of
 * whatever order the backend returns them in. Products whose category or
 * subcategory isn't part of the taxonomy sort last, keeping their relative
 * order (stable sort).
 */
export function sortProductsByTaxonomy(products) {
  return [...products].sort((a, b) => {
    const catA = categoryOrder.get(a.category) ?? categoryOrder.size;
    const catB = categoryOrder.get(b.category) ?? categoryOrder.size;
    if (catA !== catB) return catA - catB;

    const subA = subcategoryOrder.get(`${a.category}::${a.subcategory}`) ?? Infinity;
    const subB = subcategoryOrder.get(`${b.category}::${b.subcategory}`) ?? Infinity;
    return subA - subB;
  });
}
