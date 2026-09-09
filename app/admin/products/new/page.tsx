import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createProduct } from "../actions";
import AdminNav from "@/app/admin/AdminNav";
import dashboardStyles from "../../dashboard.module.css";
import styles from "./new-product.module.css";

type AdminNewProductPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const productCategories = [
  "Booking Systems",
  "Business Starter Kits",
  "Digital Product Shops",
  "Physical Product Shops",
  "Customized Websites",
  "Digital Products",
  "Business Resources",
];

function getErrorMessage(error?: string) {
  switch (error) {
    case "missing-required-fields":
      return "Please enter a product name and slug.";
    case "invalid-product-type":
      return "Please select a valid product type.";
    case "invalid-delivery-method":
      return "Please select a valid delivery method.";
    case "invalid-number":
      return "Please check the price, fee, and display order.";
    case "duplicate-slug":
      return "That product slug is already being used.";
    case "save-failed":
      return "The product could not be saved. Please try again.";
    default:
      return null;
  }
}

export default async function AdminNewProductPage({
  searchParams,
}: AdminNewProductPageProps) {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="products" email={user.email} />

        <section className="store-admin-main">
          <header
            className={dashboardStyles.topbar}
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <div>
              <span className="store-admin-eyebrow">PRODUCT CATALOG</span>
              <h1>Add Product</h1>
              <p>
                Create a storefront product, package, shop tier, or customized
                service.
              </p>
            </div>

            <div
              className={dashboardStyles.topbarActions}
              style={{
                marginLeft: "auto",
                flexShrink: 0,
              }}
            >
              <a
                href="/admin/products"
                className={dashboardStyles.secondaryButton}
              >
                ← Products
              </a>
            </div>
          </header>

          {errorMessage ? (
            <div className={styles.errorCard}>
              <div>
                <span>!</span>
              </div>
              <section>
                <strong>Couldn&apos;t save product</strong>
                <p>{errorMessage}</p>
              </section>
            </div>
          ) : null}

          <form action={createProduct} className={styles.formLayout}>
            <div className={styles.mainColumn}>
              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>PRODUCT DETAILS</span>
                  <h2>Basic information</h2>
                  <p>
                    Add the customer-facing name, descriptions, product family,
                    and tier badge.
                  </p>
                </div>

                <div className={styles.fields}>
                  <label className={styles.field}>
                    <span>Product name *</span>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Customized Booking System — Basic Package"
                      required
                    />
                    <small>
                      Include the package or tier in the name for tiered
                      products.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Product slug *</span>
                    <input
                      type="text"
                      name="slug"
                      placeholder="customized-booking-system-basic"
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      title="Use lowercase letters, numbers, and hyphens only."
                      required
                    />
                    <small>
                      Used in the product URL. Lowercase letters, numbers, and
                      hyphens only.
                    </small>
                  </label>

                  <label className={`${styles.field} ${styles.fullWidth}`}>
                    <span>Short description</span>
                    <textarea
                      name="short_description"
                      rows={3}
                      placeholder="A short, simple description for the product card."
                    />
                    <small>
                      Keep this concise. Customers will see it while browsing.
                    </small>
                  </label>

                  <label className={`${styles.field} ${styles.fullWidth}`}>
                    <span>Full description</span>
                    <textarea
                      name="description"
                      rows={8}
                      placeholder="Explain what the product does, who it is for, the main inclusions, and anything the customer should know before choosing it."
                    />
                    <small>
                      Use this for the main product overview. Detailed tier
                      comparisons can be shown on the product page.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Product family / category</span>
                    <select
                      name="category"
                      defaultValue="Booking Systems"
                      required
                    >
                      {productCategories.map((category) => (
                        <option value={category} key={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <small>
                      Choose the TCL product family this product belongs to.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Badge</span>
                    <input
                      type="text"
                      name="badge"
                      placeholder="e.g. Basic, Pro, Best Seller, For Quotation"
                    />
                    <small>
                      Useful for tiers, featured offers, and quotation products.
                    </small>
                  </label>
                </div>
              </section>

              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>POST-PURCHASE</span>
                  <h2>Customer instructions</h2>
                  <p>
                    Add the instructions customers should see only after a
                    verified successful payment.
                  </p>
                </div>

                <div className={styles.fields}>
                  <label className={`${styles.field} ${styles.fullWidth}`}>
                    <span>Post-purchase instructions</span>
                    <textarea
                      name="post_purchase_instructions"
                      rows={7}
                      placeholder="Add the instructions customers should follow after purchase, such as next steps, setup preparation, delivery expectations, or support information."
                    />
                    <small>
                      Do not place private download links here. Secure product
                      files are delivered separately after payment.
                    </small>
                  </label>
                </div>
              </section>

              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>PRICING</span>
                  <h2>Price & fees</h2>
                  <p>
                    Set the storefront price and processing fee. Quotation-only
                    services should use ₱0.
                  </p>
                </div>

                <div className={styles.fields}>
                  <label className={styles.field}>
                    <span>Regular price (₱) *</span>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      placeholder="2999.00"
                      required
                    />
                    <small>
                      Enter 0 only for quotation-only Service products.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Sale price (₱)</span>
                    <input
                      type="number"
                      name="sale_price"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                    />
                    <small>
                      Leave blank when the product is not on sale.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Processing fee (%)</span>
                    <input
                      type="number"
                      name="processing_fee_percent"
                      min="0"
                      step="0.01"
                      defaultValue="10"
                    />
                    <small>
                      Applied automatically to products purchased online.
                    </small>
                  </label>

                  <div className={styles.quoteGuide}>
                    <span>FOR QUOTATION PRODUCTS</span>
                    <strong>Use Service + ₱0</strong>
                    <p>
                      Enterprise or fully customized products with no fixed
                      price should use <b>Service</b> as both the product type
                      and delivery method, with the regular price set to 0.
                    </p>
                  </div>
                </div>
              </section>

              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>LINKS</span>
                  <h2>Product media & demo</h2>
                  <p>
                    Add public media and live-demo links when available.
                  </p>
                </div>

                <div className={styles.fields}>
                  <label className={styles.field}>
                    <span>Image URL</span>
                    <input
                      type="url"
                      name="image_url"
                      placeholder="https://..."
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Live demo URL</span>
                    <input
                      type="url"
                      name="demo_url"
                      placeholder="https://..."
                    />
                    <small>
                      Useful for booking systems, starter kits, and shop demos.
                    </small>
                  </label>
                </div>
              </section>
            </div>

            <aside className={styles.sidebar}>
              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>SETTINGS</span>
                  <h2>Product setup</h2>
                </div>

                <div className={styles.sidebarFields}>
                  <label className={styles.field}>
                    <span>Product type</span>
                    <select name="product_type" defaultValue="SERVICE">
                      <option value="DOWNLOAD">
                        Download — customer receives files
                      </option>
                      <option value="GITHUB">
                        GitHub — repository/project delivery
                      </option>
                      <option value="SERVICE">
                        Service — setup, customization, or quotation
                      </option>
                      <option value="MANUAL">
                        Manual — fulfilled manually after purchase
                      </option>
                    </select>
                    <small>
                      Customized systems and websites will usually be Service.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Delivery method</span>
                    <select name="delivery_method" defaultValue="SERVICE">
                      <option value="DOWNLOAD">Download</option>
                      <option value="GITHUB">GitHub</option>
                      <option value="SERVICE">Service / Custom setup</option>
                      <option value="MANUAL">Manual handover</option>
                    </select>
                    <small>
                      Choose how the customer actually receives the product.
                    </small>
                  </label>

                  <label className={styles.field}>
                    <span>Display order</span>
                    <input
                      type="number"
                      name="display_order"
                      min="0"
                      step="1"
                      defaultValue="0"
                    />
                    <small>
                      Lower numbers appear first in the storefront.
                    </small>
                  </label>
                </div>
              </section>

              <section className={styles.formCard}>
                <div className={styles.cardHeading}>
                  <span>VISIBILITY</span>
                  <h2>Store status</h2>
                </div>

                <div className={styles.toggleList}>
                  <label className={styles.toggleCard}>
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked
                    />
                    <span>
                      <strong>Active</strong>
                      <small>Show this product publicly in the store.</small>
                    </span>
                  </label>

                  <label className={styles.toggleCard}>
                    <input type="checkbox" name="is_featured" />
                    <span>
                      <strong>Featured</strong>
                      <small>
                        Highlight this product in featured sections.
                      </small>
                    </span>
                  </label>
                </div>
              </section>

              <section className={styles.catalogGuide}>
                <span>CATALOG ORDER GUIDE</span>
                <div>
                  <p><b>1–4</b> Booking Systems</p>
                  <p><b>5–8</b> Business Starter Kits</p>
                  <p><b>9–12</b> Digital Product Shops</p>
                  <p><b>13–16</b> Physical Product Shops</p>
                  <p><b>17</b> Customized Business Website</p>
                </div>
              </section>

              <section className={styles.saveCard}>
                <div>
                  <span>READY TO SAVE?</span>
                  <h3>Create this product</h3>
                  <p>
                    You can edit all of these details again from Product Admin.
                  </p>
                </div>

                <button type="submit">
                  Save Product <span>→</span>
                </button>

                <a href="/admin/products">Cancel</a>
              </section>
            </aside>
          </form>
        </section>
      </div>
    </main>
  );
}
