import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createProduct } from "../actions";

type AdminNewProductPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

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
        <aside className="store-admin-sidebar">
          <div className="store-admin-sidebar-brand">
            <div className="store-admin-sidebar-logo">
              TCL
            </div>

            <div>
              <strong>TCL Systems</strong>
              <span>&amp; Digitals PH</span>
            </div>
          </div>

          <div className="store-admin-sidebar-label">
            STORE ADMIN
          </div>

          <nav className="store-admin-nav">
            <a href="/admin">
              <span>⌂</span>
              Dashboard
            </a>

            <a
              className="active"
              href="/admin/products"
            >
              <span>◇</span>
              Products
            </a>

            <a href="/admin/orders">
              <span>▣</span>
              Orders
            </a>

            <a href="/admin/deliveries">
              <span>↗</span>
              Deliveries
            </a>

            <a href="/admin/customers">
              <span>♡</span>
              Customers
            </a>

            <a href="/admin/reviews">
              <span>☆</span>
              Reviews
            </a>

            <a href="/admin/settings">
              <span>⚙</span>
              Settings
            </a>
          </nav>

          <div className="store-admin-sidebar-bottom">
            <a href="/">
              <span>←</span>
              View Store
            </a>

            <div className="store-admin-user">
              <div>
                {user.email?.charAt(0).toUpperCase() || "T"}
              </div>

              <span>
                <small>Signed in as</small>
                <strong>{user.email}</strong>
              </span>
            </div>
          </div>
        </aside>

        <section className="store-admin-main">
          <header className="store-admin-topbar">
            <div>
              <a
                className="store-admin-page-back"
                href="/admin/products"
              >
                ← Products
              </a>

              <span className="store-admin-eyebrow">
                PRODUCT CATALOG
              </span>

              <h1>Add Product</h1>

              <p>
                Create a new product for your TCL storefront.
              </p>
            </div>
          </header>

          {errorMessage ? (
            <div className="store-admin-form-error">
              <strong>Couldn&apos;t save product</strong>
              <span>{errorMessage}</span>
            </div>
          ) : null}

          <form
            action={createProduct}
            className="store-admin-product-form"
          >
            <div className="store-admin-form-main">
              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>PRODUCT DETAILS</span>
                  <h2>Basic information</h2>
                  <p>
                    The main information customers will see
                    about this product.
                  </p>
                </div>

                <div className="store-admin-form-fields">
                  <label className="store-admin-field">
                    <span>Product name *</span>

                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Editable Booking System"
                      required
                    />
                  </label>

                  <label className="store-admin-field">
                    <span>Product slug *</span>

                    <input
                      type="text"
                      name="slug"
                      placeholder="editable-booking-system"
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      title="Use lowercase letters, numbers, and hyphens only."
                      required
                    />

                    <small>
                      Used in the product URL. Example:
                      editable-booking-system
                    </small>
                  </label>

                  <label className="store-admin-field">
                    <span>Short description</span>

                    <textarea
                      name="short_description"
                      rows={3}
                      placeholder="A short description for product cards and previews."
                    />
                  </label>

                  <label className="store-admin-field">
                    <span>Full description</span>

                    <textarea
                      name="description"
                      rows={7}
                      placeholder="Describe the product, what it does, and who it is for."
                    />
                  </label>

                  <div className="store-admin-form-row">
                    <label className="store-admin-field">
                      <span>Category</span>

                      <input
                        type="text"
                        name="category"
                        defaultValue="Digital Products"
                        placeholder="Digital Products"
                      />
                    </label>

                    <label className="store-admin-field">
                      <span>Badge</span>

                      <input
                        type="text"
                        name="badge"
                        placeholder="e.g. Best Seller"
                      />
                    </label>
                  </div>
                </div>
              </section>

              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>PRICING</span>
                  <h2>Price &amp; fees</h2>

                  <p>
                    Set the base price, optional sale price,
                    and processing fee.
                  </p>
                </div>

                <div className="store-admin-form-fields">
                  <div className="store-admin-form-row">
                    <label className="store-admin-field">
                      <span>Regular price (₱) *</span>

                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        placeholder="1999.00"
                        required
                      />
                    </label>

                    <label className="store-admin-field">
                      <span>Sale price (₱)</span>

                      <input
                        type="number"
                        name="sale_price"
                        min="0"
                        step="0.01"
                        placeholder="Optional"
                      />
                    </label>
                  </div>

                  <label className="store-admin-field">
                    <span>Processing fee (%)</span>

                    <input
                      type="number"
                      name="processing_fee_percent"
                      min="0"
                      step="0.01"
                      defaultValue="10"
                    />

                    <small>
                      This will later be included automatically
                      during checkout.
                    </small>
                  </label>
                </div>
              </section>

              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>LINKS</span>
                  <h2>Product links</h2>

                  <p>
                    Add product media and demo links when
                    available.
                  </p>
                </div>

                <div className="store-admin-form-fields">
                  <label className="store-admin-field">
                    <span>Image URL</span>

                    <input
                      type="url"
                      name="image_url"
                      placeholder="https://..."
                    />
                  </label>

                  <label className="store-admin-field">
                    <span>Live demo URL</span>

                    <input
                      type="url"
                      name="demo_url"
                      placeholder="https://..."
                    />
                  </label>
                </div>
              </section>
            </div>

            <aside className="store-admin-form-sidebar">
              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>SETTINGS</span>
                  <h2>Product setup</h2>
                </div>

                <div className="store-admin-form-fields">
                  <label className="store-admin-field">
                    <span>Product type</span>

                    <select
                      name="product_type"
                      defaultValue="DOWNLOAD"
                    >
                      <option value="DOWNLOAD">
                        Download
                      </option>

                      <option value="GITHUB">
                        GitHub
                      </option>

                      <option value="SERVICE">
                        Service
                      </option>

                      <option value="MANUAL">
                        Manual
                      </option>
                    </select>
                  </label>

                  <label className="store-admin-field">
                    <span>Delivery method</span>

                    <select
                      name="delivery_method"
                      defaultValue="DOWNLOAD"
                    >
                      <option value="DOWNLOAD">
                        Download
                      </option>

                      <option value="GITHUB">
                        GitHub
                      </option>

                      <option value="SERVICE">
                        Service
                      </option>

                      <option value="MANUAL">
                        Manual
                      </option>
                    </select>
                  </label>

                  <label className="store-admin-field">
                    <span>Display order</span>

                    <input
                      type="number"
                      name="display_order"
                      min="0"
                      step="1"
                      defaultValue="0"
                    />

                    <small>
                      Lower numbers appear first.
                    </small>
                  </label>
                </div>
              </section>

              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>VISIBILITY</span>
                  <h2>Store status</h2>
                </div>

                <div className="store-admin-toggle-list">
                  <label className="store-admin-checkbox">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked
                    />

                    <span>
                      <strong>Active</strong>
                      <small>
                        Show this product publicly in the store.
                      </small>
                    </span>
                  </label>

                  <label className="store-admin-checkbox">
                    <input
                      type="checkbox"
                      name="is_featured"
                    />

                    <span>
                      <strong>Featured</strong>
                      <small>
                        Highlight this product on featured
                        sections.
                      </small>
                    </span>
                  </label>
                </div>
              </section>

              <section className="store-admin-save-card">
                <p>
                  You can edit these details again anytime from
                  your Admin dashboard.
                </p>

                <button
                  className="store-admin-save-product"
                  type="submit"
                >
                  Save Product
                  <span>→</span>
                </button>

                <a href="/admin/products">
                  Cancel
                </a>
              </section>
            </aside>
          </form>
        </section>
      </div>
    </main>
  );
}