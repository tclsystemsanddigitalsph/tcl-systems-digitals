import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCatalogProduct } from "@/lib/catalog";
import { formatPrice, productPrice } from "@/lib/products";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | TCL Systems & Digitals PH",
  robots: { index: false, follow: false },
};

const checkoutStyles = `
.tcl-checkout-page {
  min-height: calc(100vh - 150px);
  padding: 32px 0 80px;
  background: linear-gradient(180deg, #fffdfd 0%, #fffafb 100%);
}

.tcl-checkout-container {
  width: min(calc(100% - 32px), 1160px);
  margin: 0 auto;
}

.tcl-checkout-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 30px;
}

.tcl-checkout-back,
.tcl-checkout-product-link {
  color: #8e6070;
  font-size: 0.78rem;
  font-weight: 750;
  text-decoration: none;
}

.tcl-checkout-secure {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #8d7580;
  font-size: 0.7rem;
  font-weight: 750;
}

.tcl-checkout-secure::before {
  content: "✓";
  display: grid;
  place-items: center;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #f6e7ed;
  color: #a35c75;
}

.tcl-checkout-heading {
  max-width: 650px;
  margin-bottom: 32px;
}

.tcl-checkout-heading h1 {
  margin: 10px 0;
  color: var(--text);
  font-size: clamp(2rem, 4vw, 3.15rem);
  line-height: 1.05;
  letter-spacing: -0.035em;
}

.tcl-checkout-heading p {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.98rem;
  line-height: 1.65;
}

.tcl-checkout-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.75fr);
  align-items: start;
  gap: 28px;
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
  border: 1px solid #eadde2;
  background: #fff;
  box-shadow: 0 18px 55px rgba(73, 47, 57, 0.06);
}

.tcl-checkout-card {
  overflow: hidden;
  border-radius: 22px;
}

.tcl-checkout-section {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 17px;
  padding: 30px;
}

.tcl-checkout-number {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f8e9ee;
  color: #9e5871;
  font-size: 0.72rem;
  font-weight: 900;
}

.tcl-checkout-section-content {
  min-width: 0;
}

.tcl-checkout-form-heading {
  margin-bottom: 18px;
}

.tcl-checkout-form-heading h2 {
  margin: 0 0 5px;
  color: var(--text);
  font-size: 1.05rem;
}

.tcl-checkout-form-heading p {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.74rem;
  line-height: 1.55;
}

.tcl-checkout-divider {
  height: 1px;
  margin-left: 85px;
  background: #f0e5e9;
}

.tcl-checkout-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 14px;
}

.tcl-checkout-fields label {
  min-width: 0;
  display: flex;
  flex-direction: column;
  color: #5f5056;
  font-size: 0.7rem;
  font-weight: 800;
}

.tcl-checkout-fields label > span {
  margin-bottom: 7px;
}

.tcl-checkout-fields input {
  display: block;
  width: 100%;
  min-width: 0;
  height: 48px;
  margin: 0;
  padding: 0 14px;
  border: 1px solid #dfd0d6;
  border-radius: 11px;
  outline: none;
  background: #fff;
  color: var(--text);
  font-size: 0.82rem;
  -webkit-appearance: none;
  appearance: none;
}

.tcl-checkout-fields input:focus {
  border-color: #c77b96;
  box-shadow: 0 0 0 3px rgba(185, 104, 132, 0.1);
}

.tcl-checkout-fields label > small {
  display: block;
  margin-top: 7px;
  color: #9a8a91;
  font-size: 0.59rem;
  font-weight: 550;
  line-height: 1.45;
}

.tcl-checkout-methods {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.tcl-checkout-method {
  position: relative;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 11px;
  min-width: 0;
  min-height: 88px;
  padding: 15px;
  border: 1px solid #e5d8dd;
  border-radius: 14px;
  background: #fff;
  color: inherit;
  font: inherit;
  text-align: left;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  touch-action: manipulation;
}

.tcl-checkout-method.is-selected {
  border-color: #bd718c;
  background: #fff9fb;
  box-shadow: 0 0 0 2px rgba(185, 104, 132, 0.08);
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
  width: 38px;
  height: 32px;
  border: 1px solid #eadde2;
  border-radius: 8px;
  background: #fff;
  color: #9f5871;
  font-size: 0.64rem;
  font-weight: 950;
}

.tcl-checkout-method-copy {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.tcl-checkout-method-copy strong {
  color: var(--text);
  font-size: 0.76rem;
}

.tcl-checkout-method-copy small {
  color: var(--text-soft);
  font-size: 0.6rem;
  font-weight: 550;
  line-height: 1.45;
}

.tcl-checkout-radio {
  width: 17px;
  height: 17px;
  border: 1.5px solid #d2bdc5;
  border-radius: 50%;
  background: #fff;
  box-shadow: inset 0 0 0 4px #fff;
}

.tcl-checkout-method.is-selected .tcl-checkout-radio {
  border-color: #b96884;
  background: #b96884;
}

.tcl-checkout-policy {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  margin: 0 0 16px;
  padding: 14px;
  border: 1px solid #eadde2;
  border-radius: 12px;
  background: #fffafb;
  color: #74666c;
  font-size: 0.68rem;
  line-height: 1.55;
}

.tcl-checkout-policy input {
  width: 16px;
  height: 16px;
  margin: 2px 0 0;
  accent-color: #b96884;
}

.tcl-checkout-policy a {
  color: #9d526c;
  font-weight: 850;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.tcl-checkout-status {
  margin: 0 0 14px;
  padding: 11px 13px;
  border: 1px solid #efcfd8;
  border-radius: 10px;
  background: #fff4f7;
  color: #8e4d62;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.5;
}

.tcl-checkout-pay {
  width: 100% !important;
  min-height: 52px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  gap: 14px !important;
  padding-inline: 18px !important;
  border-radius: 12px !important;
  font-size: 0.78rem !important;
}

.tcl-checkout-footnote {
  margin: 10px 0 0;
  color: #9a8990;
  font-size: 0.58rem;
  line-height: 1.5;
  text-align: center;
}

.tcl-checkout-summary {
  position: sticky;
  top: 96px;
  min-width: 0;
  padding: 26px;
  border-radius: 22px;
}

.tcl-checkout-summary-top {
  padding-bottom: 18px;
  border-bottom: 1px solid #eee3e7;
}

.tcl-checkout-summary-top h2 {
  margin: 8px 0 0;
  font-size: 1.15rem;
}

.tcl-checkout-product {
  padding: 20px 0;
  border-bottom: 1px solid #eee3e7;
}

.tcl-checkout-product-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 9px;
}

.tcl-checkout-product-meta span {
  padding: 5px 7px;
  border-radius: 999px;
  background: #faf0f3;
  color: #9c6075;
  font-size: 0.52rem;
  font-weight: 850;
}

.tcl-checkout-product h3 {
  margin: 0 0 8px;
  color: var(--text);
  font-size: 0.92rem;
}

.tcl-checkout-product p {
  margin: 0 0 10px;
  color: var(--text-soft);
  font-size: 0.68rem;
  line-height: 1.55;
}

.tcl-checkout-product > small {
  color: #9c8c92;
  font-size: 0.58rem;
}

.tcl-checkout-totals {
  display: grid;
  gap: 13px;
  margin: 0;
  padding: 20px 0;
  border-bottom: 1px solid #eee3e7;
}

.tcl-checkout-totals > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.tcl-checkout-totals dt,
.tcl-checkout-totals dd {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.68rem;
}

.tcl-checkout-totals dd {
  color: var(--text);
  font-weight: 750;
  text-align: right;
}

.tcl-checkout-total {
  padding-top: 13px;
  border-top: 1px dashed #e5d6dc;
}

.tcl-checkout-total dt {
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 850;
}

.tcl-checkout-total dd {
  display: grid;
  justify-items: end;
  color: #9d526c;
  font-size: 1.12rem;
  font-weight: 900;
}

.tcl-checkout-total dd small {
  color: #a99aa0;
  font-size: 0.5rem;
  letter-spacing: 0.08em;
}

.tcl-checkout-summary-note {
  margin: 18px 0;
  padding: 13px;
  border-radius: 11px;
  background: #fff8fa;
}

.tcl-checkout-summary-note strong {
  display: block;
  margin-bottom: 4px;
  color: #6c555e;
  font-size: 0.64rem;
}

.tcl-checkout-summary-note p {
  margin: 0;
  color: #8c7a81;
  font-size: 0.6rem;
  line-height: 1.55;
}

.tcl-checkout-trust {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 15px 18px;
  border-radius: 14px;
  box-shadow: none;
}

.tcl-checkout-trust-heading {
  display: grid;
  gap: 2px;
}

.tcl-checkout-trust-heading strong {
  color: #6c555e;
  font-size: 0.65rem;
}

.tcl-checkout-trust-heading span {
  color: #9b8b91;
  font-size: 0.56rem;
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
  min-width: 49px;
  height: 29px;
  padding: 0 8px;
  border: 1px solid #eadde2;
  border-radius: 7px;
  background: #fff;
  color: #735f67;
  font-size: 0.54rem;
  font-weight: 850;
}

.tcl-checkout-sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

@media (max-width: 1100px) {
  .tcl-checkout-container {
    width: min(calc(100% - 32px), 980px);
  }

  .tcl-checkout-layout {
    grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
    gap: 20px;
  }

  .tcl-checkout-section {
    padding: 26px 22px;
  }
}

@media (max-width: 900px) {
  .tcl-checkout-page {
    padding: 24px 0 60px;
  }

  .tcl-checkout-container {
    width: min(calc(100% - 28px), 760px);
  }

  .tcl-checkout-layout {
    display: flex !important;
    flex-direction: column !important;
    gap: 18px !important;
  }

  .tcl-checkout-summary {
    order: -1 !important;
    position: static !important;
    width: 100% !important;
  }

  .tcl-checkout-left {
    order: 1 !important;
    width: 100% !important;
  }

  .tcl-checkout-fields,
  .tcl-checkout-methods {
    grid-template-columns: 1fr !important;
  }

  .tcl-checkout-trust {
    width: 100%;
  }
}

@media (max-width: 700px) {
  .tcl-checkout-container {
    width: calc(100% - 24px) !important;
  }

  .tcl-checkout-topline {
    margin-bottom: 22px;
  }

  .tcl-checkout-back,
  .tcl-checkout-secure {
    font-size: 0.64rem;
  }

  .tcl-checkout-heading {
    margin-bottom: 22px;
  }

  .tcl-checkout-heading h1 {
    font-size: clamp(1.9rem, 8vw, 2.35rem);
  }

  .tcl-checkout-heading p {
    font-size: 0.84rem;
  }

  .tcl-checkout-card,
  .tcl-checkout-summary {
    border-radius: 16px;
  }

  .tcl-checkout-section {
    display: grid !important;
    grid-template-columns: 28px minmax(0, 1fr) !important;
    gap: 10px !important;
    padding: 20px 14px !important;
  }

  .tcl-checkout-number {
    width: 27px !important;
    height: 27px !important;
    font-size: 0.64rem !important;
  }

  .tcl-checkout-divider {
    margin-left: 52px !important;
  }

  .tcl-checkout-fields {
    display: flex !important;
    flex-direction: column !important;
    gap: 14px !important;
  }

  .tcl-checkout-fields label,
  .tcl-checkout-fields input {
    width: 100% !important;
    max-width: 100% !important;
  }

  .tcl-checkout-methods {
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
    width: 100% !important;
    border: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .tcl-checkout-method {
    width: 100% !important;
    min-height: 82px !important;
    grid-template-columns: 38px minmax(0, 1fr) 18px !important;
    padding: 13px !important;
    touch-action: manipulation !important;
  }

  .tcl-checkout-method-copy {
    min-width: 0 !important;
  }

  .tcl-checkout-method-copy strong,
  .tcl-checkout-method-copy small {
    overflow-wrap: anywhere;
  }

  .tcl-checkout-policy,
  .tcl-checkout-pay {
    width: 100% !important;
  }

  .tcl-checkout-summary {
    padding: 19px !important;
  }

  .tcl-checkout-trust {
    align-items: flex-start !important;
    flex-direction: column !important;
  }

  .tcl-checkout-brands {
    width: 100%;
    justify-content: flex-start !important;
  }
}

@media (max-width: 430px) {
  .tcl-checkout-page {
    padding-top: 18px;
  }

  .tcl-checkout-container {
    width: calc(100% - 18px) !important;
  }

  .tcl-checkout-topline {
    gap: 10px;
  }

  .tcl-checkout-secure {
    white-space: nowrap;
  }

  .tcl-checkout-section {
    grid-template-columns: 25px minmax(0, 1fr) !important;
    gap: 9px !important;
    padding: 18px 11px !important;
  }

  .tcl-checkout-number {
    width: 24px !important;
    height: 24px !important;
  }

  .tcl-checkout-divider {
    margin-left: 44px !important;
  }

  .tcl-checkout-form-heading h2 {
    font-size: 0.98rem;
  }

  .tcl-checkout-form-heading p {
    font-size: 0.68rem;
  }

  .tcl-checkout-method {
    grid-template-columns: 34px minmax(0, 1fr) 16px !important;
    gap: 9px !important;
    min-height: 78px !important;
    padding: 11px !important;
  }

  .tcl-checkout-method-icon {
    width: 34px !important;
    height: 30px !important;
  }

  .tcl-checkout-method-copy strong {
    font-size: 0.72rem;
  }

  .tcl-checkout-method-copy small {
    font-size: 0.56rem;
  }

  .tcl-checkout-policy {
    grid-template-columns: 17px minmax(0, 1fr);
    padding: 12px;
    font-size: 0.63rem;
  }

  .tcl-checkout-pay {
    min-height: 50px !important;
    padding-inline: 14px !important;
    font-size: 0.72rem !important;
  }

  .tcl-checkout-brands span {
    min-width: 44px;
    padding: 0 6px;
    font-size: 0.5rem;
  }
}
`;

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

            <span className="tcl-checkout-secure">Secure checkout</span>
          </div>

          <header className="tcl-checkout-heading">
            <span className="section-kicker">TCL Checkout</span>
            <h1>Complete your purchase</h1>
            <p>
              Enter your details, choose a payment method, and review your
              order.
            </p>
          </header>

          <div className="tcl-checkout-layout">
            <section className="tcl-checkout-left">
              <CheckoutForm
                productSlug={product.slug}
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
                    You&apos;ll complete payment on PayPal or PayMongo.
                  </span>
                </div>

                <div className="tcl-checkout-brands">
                  <span>PayPal</span>
                  <span>Visa</span>
                  <span>Mastercard</span>
                  <span>GCash</span>
                  <span>Maya</span>
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
                    Processing fee <small>{feePercent}%</small>
                  </dt>
                  <dd>{formatPrice(feeInCentavos / 100)}</dd>
                </div>

                <div className="tcl-checkout-total">
                  <dt>Total</dt>
                  <dd>
                    {formatPrice(totalInCentavos / 100)}
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
