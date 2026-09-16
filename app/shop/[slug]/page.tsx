import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getCatalogProduct } from "@/lib/catalog";
import { getProductPageDetails } from "@/lib/product-page-details";
import { formatPrice, productPrice, safeWebUrl } from "@/lib/products";
import styles from "./product-detail.module.css";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function DetailList({ items }: { items: string[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getCatalogProduct(slug);

  if (!product) notFound();

  const details = getProductPageDetails(product.slug);
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

  const primaryHref = quotationOnly
    ? `/quote/${encodeURIComponent(product.slug)}`
    : `/checkout?product=${encodeURIComponent(product.slug)}`;

  const primaryLabel = quotationOnly ? "Request a Quote →" : "Buy Now →";

  if (!details) {
    return (
      <>
        <SiteHeader />
        <main className={styles.page}>
          <section className={styles.hero}>
            <div className={styles.container}>
              <div className={styles.backRow}>
                <Link className={styles.backLink} href="/shop">
                  ← Back to Shop
                </Link>
              </div>

              <div className={styles.heroGrid}>
                <div>
                  <p className={styles.eyebrow}>{product.category}</p>
                  <h1 className={styles.title}>{product.name}</h1>

                  {product.short_description ? (
                    <p className={styles.lead}>{product.short_description}</p>
                  ) : null}

                  {product.description ? (
                    <p className={styles.lead}>{product.description}</p>
                  ) : null}
                </div>

                <aside className={styles.purchaseCard}>
                  <div>
                    <p className={styles.priceLabel}>
                      {quotationOnly ? "Pricing" : "Package price"}
                    </p>

                    <p className={styles.price}>
                      {quotationOnly ? "Custom Quote" : formatPrice(price)}
                    </p>
                  </div>

                  <div className={styles.actions}>
                    <Link className={styles.primary} href={primaryHref}>
                      {primaryLabel}
                    </Link>

                    {demo ? (
                      <a
                        className={styles.secondary}
                        href={demo}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Demo ↗
                      </a>
                    ) : null}
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </>
    );
  }

  const adminLabel =
    product.slug === "standard-booking-system"
      ? "Admin dashboard included"
      : product.slug === "custom-business-website"
        ? "Based on approved scope"
        : "No admin dashboard";

  const hostingLabel =
    product.slug === "custom-business-website"
      ? "Based on project requirements"
      : "Free vercel.app option";

  return (
    <>
      <SiteHeader />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <div className={styles.backRow}>
              <Link className={styles.backLink} href="/shop">
                ← Back to Shop
              </Link>
            </div>

            <div className={styles.heroGrid}>
              <div>
                <p className={styles.eyebrow}>{details.eyebrow}</p>

                <h1 className={styles.title}>{product.name}</h1>

                <p className={styles.lead}>
                  {product.short_description || details.introduction}
                </p>

                <div className={styles.badges}>
                  {product.badge ? (
                    <span className={styles.badge}>{product.badge}</span>
                  ) : null}

                  <span className={styles.badge}>Done for you</span>
                  <span className={styles.badge}>Mobile-friendly</span>
                </div>

                {image ? (
                  <img
                    className={styles.image}
                    src={image}
                    alt={product.name}
                  />
                ) : null}
              </div>

              <aside className={styles.purchaseCard}>
                <div>
                  <p className={styles.priceLabel}>
                    {quotationOnly ? "Project pricing" : "Package price"}
                  </p>

                  {quotationOnly ? (
                    <p className={styles.price}>Custom Quote</p>
                  ) : hasSale ? (
                    <p className={styles.price}>
                      <span className={styles.oldPrice}>
                        {formatPrice(product.price)}
                      </span>
                      {formatPrice(product.sale_price ?? price)}
                    </p>
                  ) : (
                    <p className={styles.price}>{formatPrice(price)}</p>
                  )}

                  <div className={styles.purchaseMeta}>
                    <div className={styles.metaRow}>
                      <span>Maintenance</span>
                      <strong>{details.maintenance.period}</strong>
                    </div>

                    <div className={styles.metaRow}>
                      <span>Management</span>
                      <strong>{adminLabel}</strong>
                    </div>

                    <div className={styles.metaRow}>
                      <span>Hosting</span>
                      <strong>{hostingLabel}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <Link className={styles.primary} href={primaryHref}>
                    {primaryLabel}
                  </Link>

                  {demo ? (
                    <a
                      className={styles.secondary}
                      href={demo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Live Demo ↗
                    </a>
                  ) : null}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.quickFacts}>
          <div className={`${styles.container} ${styles.quickFactsGrid}`}>
            <div className={styles.fact}>
              <small>Service</small>
              <strong>{details.eyebrow}</strong>
            </div>

            <div className={styles.fact}>
              <small>Setup</small>
              <strong>TCL handles the build</strong>
            </div>

            <div className={styles.fact}>
              <small>Maintenance</small>
              <strong>{details.maintenance.period}</strong>
            </div>

            <div className={styles.fact}>
              <small>Access</small>
              <strong>{adminLabel}</strong>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>THE PACKAGE</p>
              <h2 className={styles.sectionTitle}>{details.headline}</h2>
              <p className={styles.sectionText}>{details.introduction}</p>
            </div>

            <div className={styles.bestFor}>
              {details.idealFor.map((item) => (
                <span className={styles.bestForItem} key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>WHAT&apos;S INCLUDED</p>
              <h2 className={styles.sectionTitle}>
                What you&apos;re getting with this package.
              </h2>
              <p className={styles.sectionText}>
                The standard package includes the following features and setup.
              </p>
            </div>

            <div className={styles.inclusionGrid}>
              {details.inclusions.map((item, index) => (
                <article className={styles.inclusion} key={item.title}>
                  <span className={styles.number}>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>PROJECT PREPARATION</p>
              <h2 className={styles.sectionTitle}>
                You provide the business details. TCL handles the build.
              </h2>
            </div>

            <div className={styles.splitGrid}>
              <article className={styles.splitPanel}>
                <p className={styles.eyebrow}>FROM YOU</p>
                <h3>What you&apos;ll prepare</h3>
                <DetailList items={details.clientProvides} />
              </article>

              <article
                className={`${styles.splitPanel} ${styles.splitPanelPink}`}
              >
                <p className={styles.eyebrow}>FROM TCL</p>
                <h3>What TCL handles</h3>
                <DetailList items={details.tclHandles} />
              </article>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`}>
          <div className={styles.container}>
            <div className={styles.infoBand}>
              <div className={styles.infoBlock}>
                <p className={styles.eyebrow}>EDITING & MANAGEMENT</p>
                <h2 className={styles.sectionTitle}>
                  {details.editingAccess.title}
                </h2>
                <p className={styles.sectionText}>
                  {details.editingAccess.description}
                </p>
              </div>

              <div className={styles.infoBlock}>
                <p className={styles.eyebrow}>DOMAIN & HOSTING</p>
                <h2 className={styles.sectionTitle}>How your website goes live</h2>
                <DetailList items={details.domainHosting} />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.support}>
              <span className={styles.supportPeriod}>
                {details.maintenance.period} MAINTENANCE SUPPORT
              </span>

              <h2 className={styles.sectionTitle}>
                Support after your project is delivered.
              </h2>

              <p className={styles.sectionText}>
                {details.maintenance.description}
              </p>

              <div
                className={styles.splitGrid}
                style={{ marginTop: "28px" }}
              >
                <div>
                  <h3>Covered during maintenance</h3>
                  <DetailList items={details.maintenance.covered} />
                </div>

                <div>
                  <h3>Not part of maintenance</h3>
                  <DetailList items={details.maintenance.notCovered} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>SCOPE</p>
              <h2 className={styles.sectionTitle}>
                Clear inclusions before you purchase.
              </h2>
              <p className={styles.sectionText}>
                Features outside the standard package can be reviewed as an
                upgrade or custom quotation.
              </p>
            </div>

            <div className={styles.scopeGrid}>
              <div className={styles.scopeColumn}>
                <h3>Not included in this package</h3>
                <DetailList items={details.notIncluded} />
              </div>

              <div className={styles.scopeColumn}>
                <h3>Available upgrades & add-ons</h3>
                <DetailList items={details.upgrades} />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>HOW IT WORKS</p>
              <h2 className={styles.sectionTitle}>
                From purchase to project turnover.
              </h2>
            </div>

            <div className={styles.process}>
              {details.process.map((step, index) => (
                <article
                  className={styles.processItem}
                  key={`${step.title}-${index}`}
                >
                  <span className={styles.number}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.softSection}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>FAQ</p>
              <h2 className={styles.sectionTitle}>
                Questions before getting started.
              </h2>
            </div>

            <div className={styles.faqs}>
              {details.faqs.map((faq) => (
                <details className={styles.faq} key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className={styles.container}>
            <div className={styles.finalCta}>
              <p className={styles.eyebrow}>
                {quotationOnly ? "CUSTOM PROJECT" : "READY TO START?"}
              </p>

              <h2 className={styles.sectionTitle}>
                {quotationOnly
                  ? "Tell TCL what your business needs."
                  : `Ready for your ${product.name}?`}
              </h2>

              <p>
                {quotationOnly
                  ? "Submit your project requirements so the scope, pricing, and next steps can be reviewed properly."
                  : "Continue to checkout when you're ready. You'll receive the next steps for submitting your business information after payment confirmation."}
              </p>

              <Link className={styles.primary} href={primaryHref}>
                {primaryLabel}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
