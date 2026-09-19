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

type Comparison = {
  eyebrow: string;
  title: string;
  description: string;
  left: { name: string; price: string; slug: string };
  right: { name: string; price: string; slug: string };
  rows: { label: string; left: string; right: string }[];
  leftBest: string;
  rightBest: string;
};

function getComparison(slug: string): Comparison | null {
  if (slug === "basic-booking-system" || slug === "standard-booking-system") {
    return {
      eyebrow: "COMPARE BOOKING PACKAGES",
      title: "Basic or Standard Booking?",
      description:
        "Both packages let customers book online and include an admin dashboard. The main difference is how much scheduling control and booking structure your business needs.",
      left: {
        name: "Basic Booking",
        price: "₱5,999",
        slug: "basic-booking-system",
      },
      right: {
        name: "Standard Booking",
        price: "₱7,999",
        slug: "standard-booking-system",
      },
      rows: [
        {
          label: "Booking experience",
          left: "Simple, straightforward dropdown booking form",
          right: "More structured and guided booking experience",
        },
        {
          label: "Admin dashboard",
          left: "Included — essential booking management",
          right: "Included — more developed booking controls",
        },
        {
          label: "Services, variations & add-ons",
          left: "Included",
          right: "Included",
        },
        {
          label: "Availability setup",
          left: "General business-wide working days and hours",
          right: "More detailed availability controls, including service-specific setup",
        },
        {
          label: "Booking capacity",
          left: "Per-service maximum per time slot, with optional daily limit",
          right: "Designed for businesses needing more detailed scheduling controls",
        },
        {
          label: "Best suited for",
          left: "Small businesses with a simple appointment workflow",
          right: "Businesses with more detailed scheduling and booking requirements",
        },
      ],
      leftBest:
        "Choose Basic if you mainly need customers to book online and want an easy admin area without advanced scheduling complexity.",
      rightBest:
        "Choose Standard if your booking process needs a more guided customer flow and more detailed control over availability and scheduling.",
    };
  }

  if (slug === "basic-online-shop" || slug === "online-shop-with-admin") {
    return {
      eyebrow: "COMPARE ONLINE SHOP PACKAGES",
      title: "Basic Shop or Shop + Admin?",
      description:
        "Both give customers a proper online storefront. The biggest difference is management: Basic does not include an admin dashboard, while Shop + Admin lets you manage the store yourself.",
      left: {
        name: "Basic Online Shop",
        price: "₱5,999",
        slug: "basic-online-shop",
      },
      right: {
        name: "Online Shop + Admin",
        price: "₱8,999",
        slug: "online-shop-with-admin",
      },
      rows: [
        {
          label: "Customer storefront",
          left: "Included",
          right: "Included",
        },
        {
          label: "Product pages, cart & checkout",
          left: "Included",
          right: "Included",
        },
        {
          label: "Manual payment flow",
          left: "Included",
          right: "Included",
        },
        {
          label: "Admin dashboard",
          left: "Not included",
          right: "Included",
        },
        {
          label: "Manage products yourself",
          left: "No admin product manager — updates require TCL assistance and with a fee.",
          right: "Yes — add, edit, price, activate or deactivate supported products",
        },
        {
          label: "Order management",
          left: "No order-management dashboard; order notifications are sent by email",
          right: "View and manage submitted orders from the admin dashboard",
        },
        {
          label: "Payment verification",
          left: "Handled outside an admin dashboard",
          right: "Review and verify supported payment proof from the admin workflow",
        },
        {
          label: "Order status updates",
          left: "No admin status-management tools",
          right: "Update supported order statuses from the admin dashboard",
        },
        {
          label: "Best suited for",
          left: "Businesses that want a simple online storefront and rarely change products",
          right: "Businesses that want direct control over products, orders and store operations",
        },
      ],
      leftBest:
        "Choose Basic if you want customers to order from your own website but do not need to manage the shop through a dashboard.",
      rightBest:
        "Choose Shop + Admin if you want to manage products, incoming orders, payment verification and order progress yourself.",
    };
  }

  return null;
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
    product.slug === "standard-booking-system" ||
    product.slug === "basic-booking-system" ||
    product.slug === "online-shop-with-admin"
      ? "Admin dashboard included"
      : product.slug === "custom-business-website"
        ? "Based on approved scope"
        : "No admin dashboard";

  const hostingLabel =
    product.slug === "custom-business-website"
      ? "Based on project requirements"
      : "Free vercel.app option";

  const comparison = getComparison(product.slug);

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

        {comparison ? (
          <section className={`${styles.section} ${styles.comparisonSection}`}>
            <div className={styles.container}>
              <div className={styles.sectionHeader}>
                <p className={styles.eyebrow}>{comparison.eyebrow}</p>
                <h2 className={styles.sectionTitle}>{comparison.title}</h2>
                <p className={styles.sectionText}>{comparison.description}</p>
              </div>

              <div className={styles.comparisonTable}>
                <div className={`${styles.comparisonRow} ${styles.comparisonHead}`}>
                  <div className={styles.comparisonFeature}>Feature</div>

                  {[comparison.left, comparison.right].map((plan) => (
                    <div
                      className={`${styles.comparisonPlan} ${
                        product.slug === plan.slug ? styles.currentPlan : ""
                      }`}
                      key={plan.slug}
                    >
                      <strong>{plan.name}</strong>
                      <span>{plan.price}</span>
                      {product.slug === plan.slug ? <small>YOU&apos;RE VIEWING</small> : null}
                    </div>
                  ))}
                </div>

                {comparison.rows.map((row) => (
                  <div className={styles.comparisonRow} key={row.label}>
                    <div className={styles.comparisonFeature}>{row.label}</div>
                    <div className={styles.comparisonValue} data-plan-name={comparison.left.name}>{row.left}</div>
                    <div className={styles.comparisonValue} data-plan-name={comparison.right.name}>{row.right}</div>
                  </div>
                ))}
              </div>

              <div className={styles.choiceGrid}>
                <article
                  className={`${styles.choiceCard} ${
                    product.slug === comparison.left.slug ? styles.choiceCardCurrent : ""
                  }`}
                >
                  <p className={styles.choiceLabel}>CHOOSE {comparison.left.name.toUpperCase()} IF...</p>
                  <h3>{comparison.left.name}</h3>
                  <p>{comparison.leftBest}</p>
                  {product.slug !== comparison.left.slug ? (
                    <Link className={styles.compareLink} href={`/shop/${comparison.left.slug}`}>
                      View {comparison.left.name} →
                    </Link>
                  ) : (
                    <span className={styles.viewingBadge}>Current package</span>
                  )}
                </article>

                <article
                  className={`${styles.choiceCard} ${
                    product.slug === comparison.right.slug ? styles.choiceCardCurrent : ""
                  }`}
                >
                  <p className={styles.choiceLabel}>CHOOSE {comparison.right.name.toUpperCase()} IF...</p>
                  <h3>{comparison.right.name}</h3>
                  <p>{comparison.rightBest}</p>
                  {product.slug !== comparison.right.slug ? (
                    <Link className={styles.compareLink} href={`/shop/${comparison.right.slug}`}>
                      View {comparison.right.name} →
                    </Link>
                  ) : (
                    <span className={styles.viewingBadge}>Current package</span>
                  )}
                </article>
              </div>
            </div>
          </section>
        ) : null}

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
