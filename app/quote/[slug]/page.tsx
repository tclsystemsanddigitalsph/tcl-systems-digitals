import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getCatalogProduct } from "@/lib/catalog";
import QuoteForm from "./QuoteForm";
import styles from "./quote.module.css";

export const dynamic = "force-dynamic";

export default async function QuotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  /*
   * The custom-business-website quotation page must always be available.
   * It is a permanent custom-service entry point used by the homepage,
   * product page, and site header.
   *
   * We still try to load the catalog record so the displayed name/category
   * stay synced with Admin when the product exists.
   */
  if (slug === "custom-business-website") {
    const catalogProduct = await getCatalogProduct(slug);

    const productName =
      catalogProduct?.name?.trim() || "Custom Business Website";
    const productCategory =
      catalogProduct?.category?.trim() || "Websites";

    return (
      <>
        <SiteHeader />

        <main className={styles.page}>
          <section className={styles.hero}>
            <div className={`container ${styles.heroInner}`}>
              <div>
                <span className="section-kicker">Request a Quotation</span>
                <h1>Tell us what your business needs.</h1>
                <p>
                  Answer the questions below so TCL can understand your setup,
                  required features, and project scope before preparing a quote.
                </p>
              </div>

              <aside className={styles.productCard}>
                <small>Selected service</small>
                <strong>{productName}</strong>
                <span>{productCategory}</span>
                <b>For Quotation</b>
              </aside>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className="container">
              <div className={styles.topline}>
                <Link
                  href="/shop/custom-business-website"
                  className={styles.back}
                >
                  ← Back to Product
                </Link>

                <span>Usually takes only a few minutes to complete.</span>
              </div>

              <QuoteForm
                productName={productName}
                productSlug="custom-business-website"
                category={productCategory}
              />
            </div>
          </section>
        </main>

        <SiteFooter />
      </>
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
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div>
              <span className="section-kicker">Request a Quotation</span>
              <h1>Tell us what your business needs.</h1>
              <p>
                Answer the questions below so TCL can understand your setup,
                required features, and project scope before preparing a quote.
              </p>
            </div>

            <aside className={styles.productCard}>
              <small>Selected service</small>
              <strong>{product.name}</strong>
              <span>{product.category}</span>
              <b>For Quotation</b>
            </aside>
          </div>
        </section>

        <section className={styles.formSection}>
          <div className="container">
            <div className={styles.topline}>
              <Link
                href={`/shop/${encodeURIComponent(product.slug)}`}
                className={styles.back}
              >
                ← Back to Product
              </Link>

              <span>Usually takes only a few minutes to complete.</span>
            </div>

            <QuoteForm
              productName={product.name}
              productSlug={product.slug}
              category={product.category}
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
