import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCatalogProduct } from "@/lib/catalog";
import QuoteForm from "./QuoteForm";
import styles from "./quote.module.css";

export const dynamic = "force-dynamic";

function QuotationLayout({
  productName,
  productSlug,
  category,
  backHref,
}: {
  productName: string;
  productSlug: string;
  category: string;
  backHref: string;
}) {
  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.quoteShell}>
          <div className={`container ${styles.quoteShellInner}`}>
            <div className={styles.quoteUtility}>
              <div className={styles.selectedService}>
                <span>Selected service</span>
                <strong>{productName}</strong>
                <small>{category} · For Quotation</small>
              </div>
            </div>

            <QuoteForm
              productName={productName}
              productSlug={productSlug}
              category={category}
              backHref={backHref}
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

export default async function QuotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === "custom-business-website") {
    const catalogProduct = await getCatalogProduct(slug);

    const productName =
      catalogProduct?.name?.trim() || "Custom Business Website";

    const productCategory =
      catalogProduct?.category?.trim() || "Custom Development";

    return (
      <QuotationLayout
        productName={productName}
        productSlug="custom-business-website"
        category={productCategory}
        backHref="/shop/custom-business-website"
      />
    );
  }

  const product = await getCatalogProduct(slug);

  if (!product) {
    notFound();
  }

  const isQuotationOnly =
    product.product_type === "SERVICE" &&
    Number(product.sale_price ?? product.price ?? 0) === 0;

  if (!isQuotationOnly) {
    return (
      <>
        <SiteHeader />

        <main className={styles.page}>
          <div className="container">
            <section className={styles.notQuote}>
              <span className="section-kicker">TCL Quotation</span>

              <h1>This product has a fixed price.</h1>

              <p>
                You can view the product details and continue to checkout from
                its product page.
              </p>

              <Link
                className="button button-primary"
                href={`/shop/${encodeURIComponent(product.slug)}`}
              >
                Back to Product →
              </Link>
            </section>
          </div>
        </main>

        <SiteFooter />
      </>
    );
  }

  return (
    <QuotationLayout
      productName={product.name}
      productSlug={product.slug}
      category={product.category}
      backHref={`/shop/${encodeURIComponent(product.slug)}`}
    />
  );
}
