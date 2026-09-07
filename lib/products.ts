export type Product = {
  id: string; name: string; slug: string; short_description: string | null;
  description: string | null; category: string; product_type: string;
  price: number; processing_fee_percent: number; sale_price: number | null; badge: string | null;
  image_url: string | null; demo_url: string | null; is_featured: boolean;
  display_order: number; created_at: string;
};
export function productPrice(product: Product) {
  return product.sale_price ?? product.price;
}
export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
}
export function safeWebUrl(value: string | null) {
  if (!value) return undefined;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : undefined; }
  catch { return undefined; }
}
