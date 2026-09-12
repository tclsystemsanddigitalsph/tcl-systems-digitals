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
  const isCustomBusinessWebsite = product.slug === "custom-business-website";

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
              {isCustomBusinessWebsite ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <span className="shop-category-button">FOR QUOTATION</span>
                  <span className="section-kicker" style={{ margin: 0 }}>
                    {product.category}
                  </span>
                </div>
              ) : (
                <span className="section-kicker">{product.category}</span>
              )}

              <h1>{product.name}</h1>

              {product.short_description ? (
                <p>{product.short_description}</p>
              ) : null}

              {!isCustomBusinessWebsite && product.badge ? (
                <span className="shop-category-button">{product.badge}</span>
              ) : null}

              {isCustomBusinessWebsite ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    justifyContent: "center",
                    marginTop: 24,
                  }}
                >
                  <Link
                    className="button button-primary"
                    href={`/quote/${encodeURIComponent(product.slug)}`}
                  >
                    Request a Quote →
                  </Link>
                  <a className="button button-secondary" href="#details">
                    See What&apos;s Included ↓
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="shop-content" id="details">
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
                        Regular price: <del>{formatPrice(product.price)}</del>
                      </span>
                    ) : null}
                    <strong>{formatPrice(price)}</strong>
                  </>
                )}
              </div>
            </div>

            {isCustomBusinessWebsite ? (
              <>
                <section style={{ margin: "36px 0" }}>
                  <span className="section-kicker">Made For Your Business</span>
                  <h2 style={{ marginTop: 10 }}>Not a template. Built around what you need.</h2>
                  <p style={{ lineHeight: 1.8, maxWidth: 850 }}>
                    A Custom Business Website is for businesses that need more
                    than a basic website. Your website can be planned around
                    your branding, services, customer journey, workflow, and
                    the features your business actually needs.
                  </p>
                  <p style={{ lineHeight: 1.8, maxWidth: 850 }}>
                    Because every custom project is different, there is no
                    fixed price. Tell us about your business and the features
                    you need, and TCL Systems &amp; Digitals PH will review
                    your project before preparing a quotation.
                  </p>
                </section>

                <section style={{ margin: "44px 0" }}>
                  <span className="section-kicker">What We Can Build</span>
                  <h2 style={{ marginTop: 10 }}>Your website can grow with your idea.</h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 16,
                      marginTop: 22,
                    }}
                  >
                    {[
                      ["Business Websites", "Professional multi-page websites customized to your brand and services."],
                      ["Booking Systems", "Online appointment or reservation flows with business-specific booking features."],
                      ["Online Shops", "Product storefronts and purchasing experiences based on your business needs."],
                      ["Service Websites", "Custom service pages, inquiries, quotations, lead forms, and customer journeys."],
                      ["Portfolios", "Present your work, services, projects, gallery, and business information professionally."],
                      ["Custom Features", "Need something specific? Tell us the workflow or feature you have in mind."],
                    ].map(([title, text]) => (
                      <div
                        key={title}
                        style={{
                          padding: 22,
                          border: "1px solid var(--border)",
                          borderRadius: 18,
                          background: "var(--surface, #fff)",
                        }}
                      >
                        <strong style={{ display: "block", marginBottom: 8 }}>{title}</strong>
                        <p style={{ margin: 0, lineHeight: 1.65 }}>{text}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section style={{ margin: "44px 0" }}>
                  <span className="section-kicker">Customizable</span>
                  <h2 style={{ marginTop: 10 }}>Designed around your business.</h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 14,
                      marginTop: 20,
                    }}
                  >
                    {[
                      "Brand colors, fonts, logo, and visual direction",
                      "Pages and website structure",
                      "Services, products, packages, or business information",
                      "Contact, inquiry, quotation, or lead forms",
                      "Booking or appointment workflows when required",
                      "Customer-facing features and user experience",
                      "Mobile, tablet, and desktop responsive layout",
                      "Social media and contact integrations",
                      "Domain and deployment setup",
                      "Other project-specific features discussed in your quotation",
                    ].map((item) => (
                      <div
                        key={item}
                        style={{
                          padding: "16px 18px",
                          border: "1px solid var(--border)",
                          borderRadius: 14,
                          background: "var(--surface, #fff)",
                          lineHeight: 1.6,
                        }}
                      >
                        ✓ {item}
                      </div>
                    ))}
                  </div>
                </section>

                <section style={{ margin: "44px 0" }}>
                  <span className="section-kicker">How It Works</span>
                  <h2 style={{ marginTop: 10 }}>From idea to launch.</h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 14,
                      marginTop: 20,
                    }}
                  >
                    {[
                      ["01", "Request a Quote", "Tell us about your business, goals, and the website or system you need."],
                      ["02", "Project Review", "We review the scope, required features, content, and technical requirements."],
                      ["03", "Quotation", "You receive a quotation based on the actual scope of your project."],
                      ["04", "Approval", "Once the quotation and project scope are approved, we can proceed with the project."],
                      ["05", "Build & Review", "Your website is built, tested, and prepared for your review."],
                      ["06", "Launch", "After final approval, your completed website is prepared for launch and handover."],
                    ].map(([number, title, text]) => (
                      <div
                        key={number}
                        style={{
                          padding: 20,
                          border: "1px solid var(--border)",
                          borderRadius: 18,
                          background: "var(--surface, #fff)",
                        }}
                      >
                        <small style={{ fontWeight: 700 }}>{number}</small>
                        <strong style={{ display: "block", margin: "8px 0" }}>{title}</strong>
                        <p style={{ margin: 0, lineHeight: 1.6 }}>{text}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section
                  style={{
                    margin: "44px 0",
                    padding: "24px",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    background: "var(--surface, #fff)",
                  }}
                >
                  <span className="section-kicker">Before Requesting</span>
                  <h2 style={{ marginTop: 10 }}>What should you prepare?</h2>
                  <p style={{ lineHeight: 1.75 }}>
                    You do not need to have everything finalized yet. To help us
                    understand your project, prepare whatever information you
                    already have about your business, the type of website you
                    want, your preferred pages, features, branding, references,
                    target timeline, and estimated budget.
                  </p>
                </section>

                <section style={{ margin: "44px 0" }}>
                  <span className="section-kicker">Pricing &amp; Timeline</span>
                  <h2 style={{ marginTop: 10 }}>Why is this for quotation?</h2>
                  <p style={{ lineHeight: 1.8, maxWidth: 850 }}>
                    Custom projects can vary greatly in size and complexity.
                    Pricing and turnaround time depend on the number of pages,
                    required features, integrations, content, design scope,
                    revisions, and other project requirements. Your quotation
                    will be based on the scope discussed for your project.
                  </p>
                </section>

                <section style={{ margin: "44px 0" }}>
                  <span className="section-kicker">Need Something Simpler?</span>
                  <h2 style={{ marginTop: 10 }}>You may not need a custom project.</h2>
                  <p style={{ lineHeight: 1.8, maxWidth: 850 }}>
                    If you only need a clean and professional informational
                    website for your business without advanced features, our
                    Simple Business Website may be a better fit.
                  </p>
                  <Link
                    className="button button-secondary"
                    href="/shop/simple-business-website"
                  >
                    View Simple Business Website →
                  </Link>
                </section>

                <section
                  style={{
                    margin: "44px 0",
                    padding: "24px",
                    border: "1px solid var(--border)",
                    borderRadius: 20,
                    background: "var(--surface, #fff)",
                  }}
                >
                  <span className="section-kicker">Possible Additional Costs</span>
                  <h2 style={{ marginTop: 10 }}>Third-party fees may apply.</h2>
                  <p style={{ lineHeight: 1.75, maxWidth: 850 }}>
                    Depending on your project, separate provider costs may apply
                    for things such as a custom domain, paid email service,
                    payment processing, premium integrations, subscriptions, or
                    other third-party services. Any relevant costs can be
                    discussed during the quotation process.
                  </p>
                </section>

                <section style={{ margin: "44px 0" }}>
                  <span className="section-kicker">Frequently Asked</span>
                  <h2 style={{ marginTop: 10 }}>Before you request a quote.</h2>
                  <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
                    {[
                      [
                        "Is requesting a quote a commitment to purchase?",
                        "No. Your request helps TCL review your project and prepare the appropriate scope and quotation.",
                      ],
                      [
                        "Can I request a feature that is not listed here?",
                        "Yes. Describe the feature, workflow, or result you need in the quotation form so it can be reviewed.",
                      ],
                      [
                        "Can my project include an admin dashboard?",
                        "Yes, when an admin or management area is required and included in the approved project scope.",
                      ],
                      [
                        "Can you build booking or online shop features?",
                        "Yes. Booking, ecommerce, and other customer-facing workflows can be included depending on your requirements.",
                      ],
                      [
                        "What if I request more features later?",
                        "The approved quotation defines the project scope. Additional work outside that scope may require an additional fee or updated quotation.",
                      ],
                    ].map(([question, answer]) => (
                      <details
                        key={question}
                        style={{
                          padding: "18px 20px",
                          border: "1px solid var(--border)",
                          borderRadius: 14,
                          background: "var(--surface, #fff)",
                        }}
                      >
                        <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                          {question}
                        </summary>
                        <p style={{ margin: "12px 0 0", lineHeight: 1.7 }}>
                          {answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>

                <section
                  style={{
                    margin: "48px 0 12px",
                    padding: "30px 24px",
                    textAlign: "center",
                    border: "1px solid var(--border)",
                    borderRadius: 22,
                    background: "var(--surface, #fff)",
                  }}
                >
                  <span className="section-kicker">Have Something In Mind?</span>
                  <h2 style={{ margin: "10px 0" }}>Tell us what you want to build.</h2>
                  <p
                    style={{
                      lineHeight: 1.7,
                      maxWidth: 650,
                      margin: "0 auto 20px",
                    }}
                  >
                    Complete our quotation form with your project details. We&apos;ll
                    review your requirements and use them to prepare the right
                    scope and quotation for your business.
                  </p>
                  <Link
                    className="button button-primary"
                    href={`/quote/${encodeURIComponent(product.slug)}`}
                  >
                    Request a Quote →
                  </Link>
                </section>
              </>
            ) : (
              <>
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
                    <strong style={{ display: "block", marginBottom: 6 }}>
                      This service is customized to your business.
                    </strong>
                    <p style={{ margin: 0 }}>
                      Final pricing depends on your required features, workflow,
                      scope, and setup. Complete the quotation form so TCL can
                      review your requirements before preparing a price.
                    </p>
                  </div>
                ) : null}
              </>
            )}

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
                  href={`/checkout?product=${encodeURIComponent(product.slug)}`}
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
