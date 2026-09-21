import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCatalogProduct } from "@/lib/catalog";
import { formatPrice, productPrice } from "@/lib/products";
import CheckoutForm from "./CheckoutForm";
import CheckoutProcessingFeeLabel from "./CheckoutProcessingFeeLabel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | TCL Systems & Digitals PH",
  robots: { index: false, follow: false },
};

const checkoutStyles = `
.tcl-checkout-page {
  --ink: #211b1e;
  --graphite: #30272b;
  --pink: #c97b99;
  --pink-soft: #e5a9bf;
  --muted: #74666c;
  --line: rgba(70,49,58,.14);
  position: relative;
  min-height: calc(100vh - 120px);
  overflow: hidden;
  padding: 18px 0 80px;
  background:
    radial-gradient(circle at 88% 6%, rgba(229,169,191,.22), transparent 28%),
    linear-gradient(180deg, #fcfafb 0%, #f8f3f5 100%);
  color: var(--ink);
}

.tcl-checkout-page::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .36;
  background-image:
    linear-gradient(var(--line) 1px, transparent 1px),
    linear-gradient(90deg, var(--line) 1px, transparent 1px);
  background-size: 64px 64px;
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, transparent 72%);
  mask-image: linear-gradient(to bottom, #000 0%, transparent 72%);
}

.tcl-checkout-container {
  position: relative;
  z-index: 1;
  width: min(calc(100% - 48px), 1080px);
  margin: 0 auto;
}

.tcl-checkout-topline {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: 36px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--line);
}

.tcl-checkout-back,
.tcl-checkout-product-link {
  color: var(--ink);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .09em;
  text-transform: uppercase;
  text-decoration: none;
}

.tcl-checkout-back:hover,
.tcl-checkout-product-link:hover { color: var(--pink); }

.tcl-checkout-heading {
  position: relative;
  max-width: 760px;
  padding: 30px 0 30px;
}

.tcl-checkout-heading::after {
  content: "CHECKOUT";
  position: absolute;
  z-index: -1;
  top: 4px;
  right: -2vw;
  color: transparent;
  -webkit-text-stroke: 1px rgba(201,123,153,.16);
  font-size: clamp(88px, 15vw, 210px);
  line-height: .8;
  font-weight: 950;
  letter-spacing: -.08em;
  pointer-events: none;
}

.tcl-checkout-heading .section-kicker,
.tcl-checkout-summary .section-kicker {
  display: inline-block;
  padding: 0 0 9px;
  border: 0;
  border-bottom: 1px solid var(--pink);
  border-radius: 0;
  background: transparent;
  color: var(--muted);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.tcl-checkout-heading h1 {
  max-width: 900px;
  margin: 18px 0 18px;
  color: var(--ink);
  font-size: clamp(52px, 6.5vw, 88px);
  line-height: .82;
  font-weight: 950;
  letter-spacing: -.075em;
  text-transform: uppercase;
}

.tcl-checkout-heading p {
  max-width: 610px;
  margin: 0;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.72;
}

.tcl-checkout-secure {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  color: var(--ink);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.tcl-checkout-secure::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--pink);
  box-shadow: 0 0 0 5px rgba(201,123,153,.12);
}

.tcl-checkout-secure-dot { display: none; }

.tcl-checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(330px, .88fr);
  align-items: start;
  gap: 22px;
}

.tcl-checkout-left {
  min-width: 0;
  display: grid;
  gap: 16px;
}

.tcl-checkout-card,
.tcl-checkout-summary,
.tcl-checkout-trust,
.tcl-checkout-notice {
  border: 1px solid var(--line);
  border-radius: 0;
  background: rgba(255,255,255,.80);
  box-shadow: none;
  backdrop-filter: blur(12px);
}

.tcl-checkout-card { overflow: hidden; }

.tcl-checkout-section {
  display: grid;
  grid-template-columns: 42px minmax(0,1fr);
  gap: 20px;
  padding: 26px;
}

.tcl-checkout-number {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--pink);
  border-radius: 0;
  background: transparent;
  color: var(--pink);
  font-size: 10px;
  font-weight: 950;
}

.tcl-checkout-form-heading { margin-bottom: 20px; }

.tcl-checkout-form-heading h2 {
  margin: 0 0 6px;
  color: var(--ink);
  font-size: clamp(22px, 2.4vw, 32px);
  line-height: 1;
  font-weight: 900;
  letter-spacing: -.035em;
}

.tcl-checkout-form-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}

.tcl-checkout-divider {
  height: 1px;
  margin-left: 94px;
  background: var(--line);
}

.tcl-checkout-fields {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 14px;
}

.tcl-checkout-fields label {
  min-width: 0;
  display: flex;
  flex-direction: column;
  color: var(--ink);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .045em;
  text-transform: uppercase;
}

.tcl-checkout-fields label > span { margin-bottom: 8px; }

.tcl-checkout-fields input {
  width: 100%;
  min-width: 0;
  height: 50px;
  margin: 0;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 0;
  outline: none;
  background: rgba(255,255,255,.92);
  color: var(--ink);
  font-size: 13px;
  text-transform: none;
}

.tcl-checkout-fields input:focus {
  border-color: var(--pink);
  box-shadow: inset 3px 0 0 var(--pink);
}

.tcl-checkout-fields label > small {
  margin-top: 7px;
  color: var(--muted);
  font-size: 10px;
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: 0;
  text-transform: none;
}

.tcl-checkout-methods {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.tcl-checkout-method {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  min-height: 150px;
  padding: 18px 17px 16px;
  border: 1px solid var(--line);
  border-radius: 0;
  background: rgba(255,255,255,.78);
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transition: border-color .2s ease, background .2s ease, transform .2s ease;
}

.tcl-checkout-method::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  width: 100%;
  height: 54px;
  pointer-events: none;
  z-index: 0;
  transition: background .2s ease;
}

.tcl-checkout-method > * {
  position: relative;
  z-index: 1;
}

/* Provider colors are tied to each radio value, not DOM position. */
.tcl-checkout-method-paypal::before {
  background: #e7f1fb;
}

.tcl-checkout-method-paymongo::before {
  background: #e7f5ec;
}

.tcl-checkout-method-bpi::before {
  background: #fbe9e9;
}

.tcl-checkout-method:hover {
  border-color: rgba(201,123,153,.5);
  transform: translateY(-2px);
}

.tcl-checkout-method.is-selected {
  border-color: var(--pink);
  background: linear-gradient(145deg, rgba(229,169,191,.13), rgba(255,255,255,.9));
  box-shadow: none;
}

.tcl-checkout-method input {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

.tcl-checkout-method-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 30px;
  margin-bottom: 19px;
  border: 1px solid var(--line);
  border-radius: 0;
  background: #fff;
  color: var(--graphite);
  font-size: 9px;
  font-weight: 950;
  letter-spacing: .04em;
}

.tcl-checkout-method-copy {
  min-width: 0;
  display: block;
  padding-right: 24px;
}

.tcl-checkout-method-copy strong {
  display: block;
  margin-bottom: 7px;
  color: var(--ink);
  font-size: 13px;
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -.015em;
}

.tcl-checkout-method-copy small {
  display: block;
  color: var(--muted);
  font-size: 10px;
  font-weight: 500;
  line-height: 1.45;
}

.tcl-checkout-radio {
  position: absolute;
  top: 18px;
  right: 17px;
  width: 14px;
  height: 14px;
  border: 1px solid var(--muted);
  border-radius: 50%;
  background: #fff;
  box-shadow: inset 0 0 0 3px #fff;
}

.tcl-checkout-method.is-selected .tcl-checkout-radio {
  border-color: var(--pink);
  background: var(--pink);
}

.tcl-checkout-policy {
  margin: 0 0 16px;
  padding: 14px !important;
  border: 1px solid var(--line) !important;
  border-radius: 0 !important;
  background: rgba(229,169,191,.07) !important;
  color: var(--muted) !important;
  font-size: 11px !important;
  line-height: 1.55;
}

.tcl-checkout-policy a { color: var(--ink) !important; }

.tcl-checkout-status {
  margin: 0 0 14px;
  padding: 12px 14px;
  border: 1px solid rgba(201,123,153,.45);
  border-radius: 0;
  background: rgba(229,169,191,.09);
  color: var(--ink);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.5;
}

.tcl-checkout-pay {
  width: 100% !important;
  min-height: 54px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 14px !important;
  padding-inline: 18px !important;
  border: 1px solid var(--graphite) !important;
  border-radius: 0 !important;
  background: var(--graphite) !important;
  color: #fff !important;
  box-shadow: none !important;
  font-size: 11px !important;
  font-weight: 900 !important;
  letter-spacing: .055em !important;
  text-transform: uppercase !important;
}

.tcl-checkout-pay:hover {
  background: var(--pink) !important;
  border-color: var(--pink) !important;
}

.tcl-checkout-footnote {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.5;
  text-align: center;
}

.tcl-checkout-summary {
  position: sticky;
  top: 96px;
  min-width: 0;
  padding: 24px;
}

.tcl-checkout-summary-top {
  padding-bottom: 20px;
  border-bottom: 1px solid var(--line);
}

.tcl-checkout-summary-top h2 {
  margin: 14px 0 0;
  color: var(--ink);
  font-size: clamp(28px,3vw,40px);
  line-height: .95;
  font-weight: 950;
  letter-spacing: -.05em;
  text-transform: uppercase;
}

.tcl-checkout-product {
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
}

.tcl-checkout-product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 12px;
}

.tcl-checkout-product-meta span {
  padding: 5px 7px;
  border: 1px solid var(--line);
  border-radius: 0;
  background: transparent;
  color: var(--muted);
  font-size: 9px;
  font-weight: 850;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.tcl-checkout-product h3 {
  margin: 0 0 9px;
  color: var(--ink);
  font-size: 20px;
  line-height: 1.05;
  letter-spacing: -.025em;
}

.tcl-checkout-product p {
  margin: 0 0 10px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.6;
}

.tcl-checkout-product > small {
  color: var(--muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.tcl-checkout-totals {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.tcl-checkout-totals > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 10px 0;
}

.tcl-checkout-totals dt,
.tcl-checkout-totals dd {
  margin: 0;
  color: var(--muted);
  font-size: 11px;
}

.tcl-checkout-totals dd {
  color: var(--ink);
  font-weight: 850;
  text-align: right;
}

.tcl-checkout-total {
  margin-top: 8px;
  padding-top: 17px !important;
  border-top: 1px solid var(--ink);
}

.tcl-checkout-total dt {
  color: var(--ink);
  font-size: 11px;
  font-weight: 950;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.tcl-checkout-total dd {
  display: grid;
  justify-items: end;
  color: var(--pink);
  font-size: 24px;
  font-weight: 950;
  letter-spacing: -.035em;
}

.tcl-checkout-total dd small {
  color: var(--muted);
  font-size: 8px;
  letter-spacing: .12em;
}

.tcl-checkout-summary-note {
  margin: 20px 0;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: 0;
  background: rgba(229,169,191,.07);
}

.tcl-checkout-summary-note strong {
  display: block;
  margin-bottom: 5px;
  color: var(--ink);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.tcl-checkout-summary-note p {
  margin: 0;
  color: var(--muted);
  font-size: 10px;
  line-height: 1.6;
}

.tcl-checkout-trust {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 18px;
}

.tcl-checkout-trust-heading {
  display: grid;
  gap: 3px;
}

.tcl-checkout-trust-heading strong {
  color: var(--ink);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .04em;
  text-transform: uppercase;
}

.tcl-checkout-trust-heading span {
  color: var(--muted);
  font-size: 9px;
}

.tcl-checkout-brands {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.tcl-checkout-brands span {
  display: grid;
  place-items: center;
  min-width: 48px;
  height: 28px;
  padding: 0 7px;
  border: 1px solid var(--line);
  border-radius: 0;
  background: #fff;
  color: var(--graphite);
  font-size: 8px;
  font-weight: 900;
}

.tcl-checkout-selected-design,
.tcl-checkout-form-design {
  border-radius: 0 !important;
  border-color: var(--line) !important;
  background: rgba(229,169,191,.07) !important;
}

.tcl-checkout-sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0,0,0,0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.tcl-checkout-notice {
  padding: 34px;
}

.tcl-checkout-notice h1 {
  margin: 0 0 10px;
  font-size: 34px;
  letter-spacing: -.04em;
}

.tcl-checkout-notice p {
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 760px) {
  .tcl-checkout-methods {
    grid-template-columns: 1fr;
  }

  .tcl-checkout-method {
    min-height: 0;
    padding: 16px 48px 16px 16px;
  }

  .tcl-checkout-method-icon {
    margin-bottom: 12px;
  }
}

@media (max-width: 900px) {
  .tcl-checkout-page { padding: 14px 0 60px; }
  .tcl-checkout-container { width: min(calc(100% - 28px),760px); }
  .tcl-checkout-layout {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .tcl-checkout-summary {
    order: -1;
    position: static;
    width: 100%;
  }
  .tcl-checkout-left { order: 1; width: 100%; }
  .tcl-checkout-heading { padding: 26px 0 26px; }
  .tcl-checkout-heading::after { right: -12vw; }
}

@media (max-width: 700px) {
  .tcl-checkout-container { width: calc(100% - 24px); }
  .tcl-checkout-heading h1 { font-size: clamp(48px,15vw,72px); }
  .tcl-checkout-heading p { font-size: 13px; }
  .tcl-checkout-section {
    grid-template-columns: 30px minmax(0,1fr);
    gap: 11px;
    padding: 22px 15px;
  }
  .tcl-checkout-number { width: 28px; height: 28px; }
  .tcl-checkout-divider { margin-left: 56px; }
  .tcl-checkout-fields { grid-template-columns: 1fr; }
  .tcl-checkout-summary { padding: 21px; }
  .tcl-checkout-trust {
    align-items: flex-start;
    flex-direction: column;
  }
  .tcl-checkout-brands { justify-content: flex-start; }
}

@media (max-width: 430px) {
  .tcl-checkout-page { padding-top: 18px; }
  .tcl-checkout-container { width: calc(100% - 18px); }
  .tcl-checkout-heading { padding-top: 22px; }
  .tcl-checkout-heading h1 { font-size: 46px; }
  .tcl-checkout-section {
    grid-template-columns: 26px minmax(0,1fr);
    gap: 9px;
    padding: 19px 11px;
  }
  .tcl-checkout-number { width: 24px; height: 24px; font-size: 8px; }
  .tcl-checkout-divider { margin-left: 46px; }
  .tcl-checkout-method {
    grid-template-columns: 34px minmax(0,1fr) 15px;
    min-height: 86px;
    padding: 11px;
  }
  .tcl-checkout-summary-top h2 { font-size: 30px; }
}
`;

const SIMPLE_WEBSITE_DESIGNS: Record<string, string> = {
  "aesthetic-soft": "Aesthetic & Soft",
  "clean-minimal": "Clean & Minimal",
  "professional-business": "Professional Business",
  "bold-creative": "Bold & Creative",
  "modern-monochrome": "Modern Monochrome",
  "modern-refined": "Modern & Refined",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string | string[];
    design?: string | string[];
    cancelled?: string | string[];
    payment_error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const slug = params.product;
  const designParam =
    typeof params.design === "string" ? params.design.trim() : "";
  const cancelled = params.cancelled === "1";
  const paymentError = params.payment_error === "1";

  if (typeof slug !== "string" || !slug.trim()) redirect("/shop");

  let product;

  try {
    product = await getCatalogProduct(slug);
  } catch {
    return (
      <>
        <style>{checkoutStyles}</style>
        <SiteHeader />
        <main className="tcl-checkout-page">
          <div className="tcl-checkout-container">
            <section className="tcl-checkout-notice">
              <h1>Checkout is temporarily unavailable.</h1>
              <p>Please return to the shop and try again shortly.</p>
              <Link href="/shop" className="tcl-checkout-back">
                ← Back to Shop
              </Link>
            </section>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!product) notFound();

  const requiresDesign =
    product.slug === "simple-business-website-template";

  const selectedDesignSlug = requiresDesign ? designParam : "";
  const selectedDesignLabel = requiresDesign
    ? SIMPLE_WEBSITE_DESIGNS[selectedDesignSlug] ?? ""
    : "";

  if (requiresDesign && !selectedDesignLabel) {
    redirect(
      `/shop/${encodeURIComponent(product.slug)}#choose-design`
    );
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

  return (
    <>
      <style>{checkoutStyles}</style>
      <SiteHeader />

      <main className="tcl-checkout-page">
        <div className="tcl-checkout-container">
          <div className="tcl-checkout-topline">
            <Link href={productHref} className="tcl-checkout-back">
              ← Back to Product
            </Link>
          </div>

          <header className="tcl-checkout-heading">
            <span className="section-kicker">TCL Checkout</span>
            <h1>Complete your purchase</h1>
            <p>
              Enter your details, choose a payment method, and review your
              order.
            </p>

            <span className="tcl-checkout-secure">
              <span className="tcl-checkout-secure-dot" aria-hidden="true">
              </span>
              Secure checkout
            </span>
          </header>

          <div className="tcl-checkout-layout">
            <section className="tcl-checkout-left">
              <CheckoutForm
                productSlug={product.slug}
                selectedDesignSlug={selectedDesignSlug}
                selectedDesignLabel={selectedDesignLabel}
                cancelled={cancelled}
                paymentError={paymentError}
              />

              <section
                className="tcl-checkout-trust"
                aria-label="Accepted payment methods"
              >
                <div className="tcl-checkout-trust-heading">
                  <strong>Secure payment</strong>
                  <span>
                    PayPal, PayMongo, or direct BPI bank transfer.
                  </span>
                </div>

                <div className="tcl-checkout-brands">
                  <span>PayPal</span>
                  <span>Visa</span>
                  <span>Mastercard</span>
                  <span>GCash</span>
                  <span>Maya</span>
                  <span>BPI</span>
                </div>
              </section>
            </section>

            <aside
              className="tcl-checkout-summary"
              aria-labelledby="summary-heading"
            >
              <div className="tcl-checkout-summary-top">
                <span className="section-kicker">Your purchase</span>
                <h2 id="summary-heading">Order summary</h2>
              </div>

              <div className="tcl-checkout-product">
                <div className="tcl-checkout-product-meta">
                  <span>{product.category}</span>
                  <span>Digital purchase</span>
                </div>

                <h3>{product.name}</h3>

                {selectedDesignLabel ? (
                  <div className="tcl-checkout-selected-design">
                    <span>Selected design</span>
                    <strong>{selectedDesignLabel}</strong>
                  </div>
                ) : null}

                {product.short_description ? (
                  <p>{product.short_description}</p>
                ) : null}

                <small>Quantity 1</small>
              </div>

              <dl className="tcl-checkout-totals">
                {hasSale ? (
                  <div>
                    <dt>Regular price</dt>
                    <dd>
                      <del>{formatPrice(product.price)}</del>
                    </dd>
                  </div>
                ) : null}

                <div>
                  <dt>{hasSale ? "Sale price" : "Product price"}</dt>
                  <dd>{formatPrice(priceInCentavos / 100)}</dd>
                </div>

                <div>
                  <dt>
                    <CheckoutProcessingFeeLabel />
                  </dt>
                  <dd
                    id="tcl-checkout-processing-fee-amount"
                    data-provider-amount={formatPrice(feeInCentavos / 100)}
                    data-bpi-amount={formatPrice(0)}
                  >
                    {formatPrice(feeInCentavos / 100)}
                  </dd>
                </div>

                <div className="tcl-checkout-total">
                  <dt>Total</dt>
                  <dd>
                    <span
                      id="tcl-checkout-total-amount"
                      data-provider-amount={formatPrice(totalInCentavos / 100)}
                      data-bpi-amount={formatPrice(priceInCentavos / 100)}
                    >
                      {formatPrice(totalInCentavos / 100)}
                    </span>
                    <small>PHP</small>
                  </dd>
                </div>
              </dl>

              <div className="tcl-checkout-summary-note">
                <strong>What happens next?</strong>
                <p>
                  After payment is verified, you&apos;ll be redirected to your
                  secure receipt and delivery page.
                </p>
              </div>

              <Link href={productHref} className="tcl-checkout-product-link">
                View product details →
              </Link>
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
