import PATHS from '@/routes/paths';

export const productPath = (category, subcategory) => {
  const params = new URLSearchParams({ category });
  if (subcategory) params.set('subcategory', subcategory);
  return `${PATHS.PRODUCTS}?${params.toString()}`;
};

// Desktop-only taxonomy shared by DealSection (category tiles) and the
// Navbar "All" mega menu. Deliberately NOT used by MobileCategories.jsx —
// that component keeps its own inline copy so the mobile carousel stays
// completely untouched by any change here.
//
// `subtitle`/`cta` are deliberately navigational ("what's in here"), not
// promotional ("up to X% off") — a category is permanent, a promotion is
// temporary, and the tiles shouldn't imply an active sale that may not
// exist.
export const CATEGORY_GROUPS = [
  {
    title: 'Electronics',
    subtitle: "Mobiles, laptops & gadgets",
    cta: 'Explore Electronics',
    category: 'Electronics',
    heroImage: '/images/electronics-hero-promo.webp',
    // Only this banner has "Sale / Up to 60% off" baked into the image
    // itself (pixels, not editable via code) — the other three read fine
    // as permanent headlines. Zoomed + anchored right to crop the
    // promotional text block out of frame, keeping just the product shot.
    imageCrop: { transform: 'scale(1.8)', transformOrigin: 'right center' },
    link: productPath('Electronics'),
    items: [
      { label: 'Mobiles',   link: productPath('Electronics', 'Mobile') },
      { label: 'Laptops',   link: productPath('Electronics', 'Laptop') },
      { label: 'Earphones', link: productPath('Electronics', 'Headphones') },
      { label: 'Cameras',   link: productPath('Electronics', 'Camera') },
    ],
  },
  {
    title: 'Fashion',
    subtitle: "Men's, women's & footwear",
    cta: 'Explore Fashion',
    category: 'Clothing',
    heroImage: '/images/fashion-hero-promo.webp',
    link: productPath('Clothing'),
    items: [
      { label: "Men's Wear",  link: productPath('Clothing', 'Shirt') },
      { label: "Women's",     link: productPath('Clothing', 'Dress') },
      { label: 'Footwear',    link: productPath('Clothing', 'Shoes') },
      { label: 'Accessories', link: productPath('Clothing') },
    ],
  },
  {
    title: 'Home & Living',
    subtitle: 'Furniture, kitchen & decor',
    cta: 'Explore Home',
    category: 'Home',
    heroImage: '/images/home-hero-promo.webp',
    link: productPath('Home'),
    items: [
      { label: 'Furniture', link: productPath('Home', 'Furniture') },
      { label: 'Kitchen',   link: productPath('Home', 'Kitchen') },
      { label: 'Decor',     link: productPath('Home', 'Decor') },
      { label: 'Bedding',   link: productPath('Home') },
    ],
  },
  {
    title: 'Books & More',
    subtitle: 'Books, sports & entertainment',
    cta: 'Explore Books & More',
    category: 'Books',
    heroImage: '/images/books-hero-promo.webp',
    link: productPath('Books'),
    items: [
      { label: 'Bestsellers', link: productPath('Books', 'Novel') },
      { label: 'Sports Gear', link: productPath('Sports') },
      { label: 'Fitness',     link: productPath('Sports', 'Gym') },
      { label: 'Outdoor',     link: productPath('Sports') },
    ],
  },
];

// Full taxonomy for the Navbar "All Categories" mega menu — one column per
// top-level category, every subcategory listed (not just 4 curated highlights
// like CATEGORY_GROUPS above, which drives the homepage hero tiles and can't
// grow a 5th tile without a matching hero image).
export const MEGA_MENU_GROUPS = [
  {
    title: 'Electronics',
    link: productPath('Electronics'),
    items: [
      { label: 'Mobile',      link: productPath('Electronics', 'Mobile') },
      { label: 'Laptop',      link: productPath('Electronics', 'Laptop') },
      { label: 'TV',          link: productPath('Electronics', 'TV') },
      { label: 'Tablet',      link: productPath('Electronics', 'Tablet') },
      { label: 'Camera',      link: productPath('Electronics', 'Camera') },
      { label: 'Headphones',  link: productPath('Electronics', 'Headphones') },
      { label: 'Gadgets',     link: productPath('Electronics', 'Gadgets') },
    ],
  },
  {
    title: 'Clothing',
    link: productPath('Clothing'),
    items: [
      { label: 'Shirt',  link: productPath('Clothing', 'Shirt') },
      { label: 'Jeans',  link: productPath('Clothing', 'Jeans') },
      { label: 'Dress',  link: productPath('Clothing', 'Dress') },
      { label: 'Shoes',  link: productPath('Clothing', 'Shoes') },
      { label: 'Jacket', link: productPath('Clothing', 'Jacket') },
      { label: 'Kurta',  link: productPath('Clothing', 'Kurta') },
    ],
  },
  {
    title: 'Books',
    link: productPath('Books'),
    items: [
      { label: 'Textbook',   link: productPath('Books', 'Textbook') },
      { label: 'Novel',      link: productPath('Books', 'Novel') },
      { label: 'Stationery', link: productPath('Books', 'Stationery') },
      { label: 'Comics',     link: productPath('Books', 'Comics') },
    ],
  },
  {
    title: 'Home',
    link: productPath('Home'),
    items: [
      { label: 'Furniture',  link: productPath('Home', 'Furniture') },
      { label: 'Appliances', link: productPath('Home', 'Appliances') },
      { label: 'Decor',      link: productPath('Home', 'Decor') },
      { label: 'Kitchen',    link: productPath('Home', 'Kitchen') },
    ],
  },
  {
    title: 'Sports',
    link: productPath('Sports'),
    items: [
      { label: 'Cricket',  link: productPath('Sports', 'Cricket') },
      { label: 'Football', link: productPath('Sports', 'Football') },
      { label: 'Gym',      link: productPath('Sports', 'Gym') },
      { label: 'Yoga',     link: productPath('Sports', 'Yoga') },
    ],
  },
];
