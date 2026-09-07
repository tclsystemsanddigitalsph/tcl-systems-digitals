import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCatalogProduct } from "@/lib/catalog";
import { formatPrice, productPrice, safeWebUrl } from "@/lib/products";
export const dynamic = "force-dynamic";
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);
  if (!product) notFound();
  const hasSale = product.sale_price !== null && product.sale_price < product.price;
  const image = safeWebUrl(product.image_url);
  const demo = safeWebUrl(product.demo_url);
  return <><SiteHeader /><main className="shop-page"><section className="shop-hero"><div className="container">
    <nav aria-label="Back navigation" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
      <Link href="/shop" className="product-detail-back" style={{ marginBottom: 0, minHeight: 44, display: "inline-flex", alignItems: "center" }}>← Back to Shop</Link>
    </nav>
    <div className="shop-hero-inner"><span className="section-kicker">{product.category}</span>
      <h1>{product.name}</h1><p>{product.short_description}</p>
      {product.badge && <span className="shop-category-button">{product.badge}</span>}
    </div></div></section><section className="shop-content"><div className="container">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image && <img style={{ width: "100%", maxHeight: 360, objectFit: "contain", borderRadius: 16 }} src={image} alt={product.name} />}
      <div className="product-detail-price-row"><div className="product-detail-price"><small>{hasSale ? "Sale price" : "Price"}</small>
                  {hasSale && (
                    <span style={{ display: "block", margin: "6px 0", fontSize: 16, color: "var(--text-soft)" }}>
                      Regular price: <del>{formatPrice(product.price)}</del>
                    </span>
                  )}
                  <strong>{formatPrice(productPrice(product))}</strong></div></div>
      {product.description && <p style={{ whiteSpace: "pre-wrap", margin: "24px 0", lineHeight: 1.7 }}>{product.description}</p>}
      <div className="product-detail-actions">
        <Link className="button button-primary" href={`/checkout?product=${encodeURIComponent(product.slug)}`}>Buy Now →</Link>
        {demo && <a className="button button-secondary" href={demo} target="_blank" rel="noopener noreferrer">View demo →</a>}
      </div>
    </div></section></main><SiteFooter /></>;
}
