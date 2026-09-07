import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCatalogProduct } from "@/lib/catalog";
import { formatPrice, productPrice } from "@/lib/products";
import CheckoutForm from "./CheckoutForm";
import styles from "./checkout.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | TCL Systems & Digitals PH",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string | string[];
    cancelled?: string | string[];
    payment_error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const slug = params.product;
  const cancelled = params.cancelled === "1";
  const paymentError = params.payment_error === "1";

  if (typeof slug !== "string" || !slug.trim()) {
    redirect("/shop");
  }

  // Always read prices from Supabase, never from URL amounts.
  let product;

  try {
    product = await getCatalogProduct(slug);
  } catch {
    return (
      <>
        <SiteHeader />

        <main className={styles.page}>
          <div className={`container ${styles.notice}`} role="alert">
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
                className={styles.back}
                style={{
                  minHeight: 44,
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                ← Back to Shop
              </Link>
            </nav>

            <h1>Checkout is temporarily unavailable</h1>
            <p>Please return to the shop and try again shortly.</p>
          </div>
        </main>

        <SiteFooter />
      </>
    );
  }

  if (!product) {
    notFound();
  }

  const hasSale =
    product.sale_price !== null && product.sale_price < product.price;

  const price = Number(productPrice(product));
  const feePercent = Number(product.processing_fee_percent ?? 0);

  if (
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isFinite(feePercent) ||
    feePercent < 0
  ) {
    throw new Error("This product's price is unavailable.");
  }

  const priceInCentavos = Math.round(price * 100);
  const feeInCentavos = Math.round((priceInCentavos * feePercent) / 100);
  const totalInCentavos = priceInCentavos + feeInCentavos;
  const productHref = `/shop/${encodeURIComponent(product.slug)}`;

  const paymentLogoFrameStyle = {
    width: "64px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    padding: "0",
    boxSizing: "border-box",
    background: "#ffffff",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    overflow: "hidden",
  } as const;

  const paymentLogoStyle = {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "fill",
  } as const;

  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <div className="container">
          <nav
            aria-label="Back navigation"
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Link
              href={productHref}
              className={styles.back}
              style={{
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              ← Back to Product
            </Link>
          </nav>

          <header className={styles.heading}>
            <span className="section-kicker">TCL Checkout</span>
            <h1>Complete your purchase.</h1>
            <p>Review your product and choose how you’d like to pay.</p>
          </header>

          <div className={styles.layout}>
            <CheckoutForm
              productSlug={product.slug}
              cancelled={cancelled}
              paymentError={paymentError}
            />

            <aside
              className={`${styles.card} ${styles.summary}`}
              aria-labelledby="summary-heading"
            >
              <span className="section-kicker">Your purchase</span>
              <h2 id="summary-heading">Order summary</h2>

              <div className={styles.product}>
                <small>{product.category}</small>
                <h3>{product.name}</h3>

                {product.short_description && (
                  <p>{product.short_description}</p>
                )}

                <span>Quantity: 1</span>
              </div>

              <dl className={styles.totals}>
                {hasSale && (
                  <div>
                    <dt>Regular price</dt>
                    <dd>
                      <del
                        style={{
                          color: "var(--text-soft)",
                          fontWeight: 400,
                        }}
                      >
                        {formatPrice(product.price)}
                      </del>
                    </dd>
                  </div>
                )}

                <div>
                  <dt>{hasSale ? "Sale price" : "Product price"}</dt>
                  <dd>{formatPrice(priceInCentavos / 100)}</dd>
                </div>

                <div>
                  <dt>Processing fee ({feePercent}%)</dt>
                  <dd>{formatPrice(feeInCentavos / 100)}</dd>
                </div>

                <div className={styles.total}>
                  <dt>Total</dt>
                  <dd>
                    {formatPrice(totalInCentavos / 100)}
                    <small>PHP</small>
                  </dd>
                </div>
              </dl>

              <Link href={productHref} className={styles.back}>
                View product details →
              </Link>
            </aside>
          </div>

          <section
            aria-label="Payment logos"
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              marginTop: 32,
              padding: "24px 0 0",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                alignItems: "center",
                gap: "clamp(8px, 2vw, 20px)",
                width: "100%",
                maxWidth: 380,
                margin: "0 auto",
              }}
            >
              <div style={paymentLogoFrameStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                  alt="PayPal"
                  width={64}
                  height={44}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  style={paymentLogoStyle}
                />
              </div>

              <div style={paymentLogoFrameStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.paymongo.com/images/logos/payment-methods/visa.svg"
                  alt="Visa"
                  width={64}
                  height={44}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  style={paymentLogoStyle}
                />
              </div>

              <div style={paymentLogoFrameStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.paymongo.com/images/logos/payment-methods/mastercard.svg"
                  alt="Mastercard"
                  width={64}
                  height={44}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  style={paymentLogoStyle}
                />
              </div>

              <div style={paymentLogoFrameStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.paymongo.com/images/logos/payment-methods/gcash.svg"
                  alt="GCash"
                  width={64}
                  height={44}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  style={paymentLogoStyle}
                />
              </div>

              <div style={paymentLogoFrameStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://www.paymongo.com/images/logos/payment-methods/maya.svg"
                  alt="Maya"
                  width={64}
                  height={44}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  style={paymentLogoStyle}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
