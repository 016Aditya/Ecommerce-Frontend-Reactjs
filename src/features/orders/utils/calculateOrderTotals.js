const SHIPPING_THRESHOLD = 499;
const SHIPPING_COST      = 40;
const TAX_RATE           = 0.18;

export function calculateOrderTotals(cartTotal = 0) {
  const subtotal = cartTotal;
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax       = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total     = subtotal + shipping + tax;

  return { subtotal, shipping, tax, total };
}
