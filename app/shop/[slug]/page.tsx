import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCatalogProduct } from "@/lib/catalog";
import { formatPrice, productPrice, safeWebUrl } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);

  if (!product) {
    notFound();
  }

  const price = Number(productPrice(product));
  const quotationOnly =
    product.product_type === "SERVICE" &&
    Number.isFinite(price) &&
    price === 0;

  const hasSale =
    !quotationOnly &&
    product.sale_price !== null &&
    product.sale_price < product.price;

  const image = safeWebUrl(product.image_url);
  const demo = safeWebUrl(product.demo_url);

  return (
    <>
      <SiteHeader />

      <main className="shop-page">
        <section className="shop-hero">
          <div className="container">
            <nav
              aria-label="Back navigation"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: 24,
              }}
            >
              <Link
                href="/shop"
                className="product-detail-back"
                style={{
                  marginBottom: 0,
                  minHeight: 44,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                ← Back to Shop
              </Link>
            </nav>

            <div className="shop-hero-inner">
              <span className="section-kicker">
                {product.category}
              </span>

              <h1>{product.name}</h1>

              {product.short_description ? (
                <p>{product.short_description}</p>
              ) : null}

              {product.badge ? (
                <span className="shop-category-button">
                  {product.badge}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="shop-content">
          <div className="container">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                style={{
                  width: "100%",
                  maxHeight: 360,
                  objectFit: "contain",
                  borderRadius: 16,
                }}
                src={image}
                alt={product.name}
              />
            ) : null}

            <div className="product-detail-price-row">
              <div className="product-detail-price">
                <small>
                  {quotationOnly
                    ? "Pricing"
                    : hasSale
                      ? "Sale price"
                      : "Price"}
                </small>

                {quotationOnly ? (
                  <strong>For Quotation</strong>
                ) : (
                  <>
                    {hasSale ? (
                      <span
                        style={{
                          display: "block",
                          margin: "6px 0",
                          fontSize: 16,
                          color: "var(--text-soft)",
                        }}
                      >
                        Regular price:{" "}
                        <del>{formatPrice(product.price)}</del>
                      </span>
                    ) : null}

                    <strong>{formatPrice(price)}</strong>
                  </>
                )}
              </div>
            </div>

            {product.description ? (
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  margin: "24px 0",
                  lineHeight: 1.7,
                }}
              >
                {product.description}
              </p>
            ) : null}

            {quotationOnly ? (
              <div
                style={{
                  margin: "24px 0",
                  padding: "18px 20px",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  background: "var(--surface, #fff)",
                  lineHeight: 1.65,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  This service is customized to your business.
                </strong>

                <p style={{ margin: 0 }}>
                  Final pricing depends on your required features,
                  workflow, scope, and setup. Complete the quotation form
                  so TCL can review your requirements before preparing a
                  price.
                </p>
              </div>
            ) : null}

            <div className="product-detail-actions">
              {quotationOnly ? (
                <Link
                  className="button button-primary"
                  href={`/quote/${encodeURIComponent(product.slug)}`}
                >
                  Request a Quote →
                </Link>
              ) : (
                <Link
                  className="button button-primary"
                  href={`/checkout?product=${encodeURIComponent(
                    product.slug,
                  )}`}
                >
                  Buy Now →
                </Link>
              )}

              {demo ? (
                <a
                  className="button button-secondary"
                  href={demo}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View demo →
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
