import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  deleteProduct,
  updateProduct,
} from "../actions";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
    updated?: string;
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
      return "The product could not be updated. Please try again.";

    case "delete-failed":
      return "The product could not be deleted. Please try again.";

    default:
      return null;
  }
}

export default async function EditProductPage({
  params,
  searchParams,
}: EditProductPageProps) {
  const authSupabase =
    await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const query = await searchParams;

  const adminSupabase =
    createAdminSupabaseClient();

  const { data: product, error } =
    await adminSupabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

  if (error) {
    console.error(
      "Edit product load error:",
      error
    );
  }

  if (!product) {
    notFound();
  }

  const errorMessage =
    getErrorMessage(query.error);

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
                {user.email
                  ?.charAt(0)
                  .toUpperCase() || "T"}
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
              <span className="store-admin-eyebrow">
                PRODUCT CATALOG
              </span>

              <h1>Edit Product</h1>

              <p>
                Update {product.name} and its
                storefront settings.
              </p>

              <a
                className="store-admin-page-back"
                href="/admin/products"
              >
                ← Back to Products
              </a>
            </div>
          </header>

          {query.updated === "1" ? (
            <div className="store-admin-form-success">
              <strong>
                Product updated ♡
              </strong>

              <span>
                Your changes have been saved
                successfully.
              </span>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="store-admin-form-error">
              <strong>
                Couldn&apos;t update product
              </strong>

              <span>{errorMessage}</span>
            </div>
          ) : null}

          <form
            action={updateProduct}
            className="store-admin-product-form"
          >
            <input
              type="hidden"
              name="product_id"
              value={product.id}
            />

            <div className="store-admin-form-main">
              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>PRODUCT DETAILS</span>
                  <h2>Basic information</h2>

                  <p>
                    Update the information customers
                    see about this product.
                  </p>
                </div>

                <div className="store-admin-form-fields">
                  <label className="store-admin-field">
                    <span>
                      Product name *
                    </span>

                    <input
                      type="text"
                      name="name"
                      defaultValue={
                        product.name
                      }
                      required
                    />
                  </label>

                  <label className="store-admin-field">
                    <span>
                      Product slug *
                    </span>

                    <input
                      type="text"
                      name="slug"
                      defaultValue={
                        product.slug
                      }
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      title="Use lowercase letters, numbers, and hyphens only."
                      required
                    />

                    <small>
                      Used in the product URL.
                    </small>
                  </label>

                  <label className="store-admin-field">
                    <span>
                      Short description
                    </span>

                    <textarea
                      name="short_description"
                      rows={3}
                      defaultValue={
                        product.short_description ??
                        ""
                      }
                    />
                  </label>

                  <label className="store-admin-field">
                    <span>
                      Full description
                    </span>

                    <textarea
                      name="description"
                      rows={7}
                      defaultValue={
                        product.description ??
                        ""
                      }
                    />
                  </label>

                  <div className="store-admin-form-row">
                    <label className="store-admin-field">
                      <span>
                        Category
                      </span>

                      <input
                        type="text"
                        name="category"
                        defaultValue={
                          product.category ??
                          "Digital Products"
                        }
                      />
                    </label>

                    <label className="store-admin-field">
                      <span>
                        Badge
                      </span>

                      <input
                        type="text"
                        name="badge"
                        defaultValue={
                          product.badge ??
                          ""
                        }
                        placeholder="e.g. Best Seller"
                      />
                    </label>
                  </div>
                </div>
              </section>

              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>PRICING</span>

                  <h2>
                    Price &amp; fees
                  </h2>

                  <p>
                    Update the regular price,
                    sale price, and processing fee.
                  </p>
                </div>

                <div className="store-admin-form-fields">
                  <div className="store-admin-form-row">
                    <label className="store-admin-field">
                      <span>
                        Regular price (₱) *
                      </span>

                      <input
                        type="number"
                        name="price"
                        min="0"
                        step="0.01"
                        defaultValue={
                          product.price ??
                          0
                        }
                        required
                      />
                    </label>

                    <label className="store-admin-field">
                      <span>
                        Sale price (₱)
                      </span>

                      <input
                        type="number"
                        name="sale_price"
                        min="0"
                        step="0.01"
                        defaultValue={
                          product.sale_price ??
                          ""
                        }
                        placeholder="Optional"
                      />
                    </label>
                  </div>

                  <label className="store-admin-field">
                    <span>
                      Processing fee (%)
                    </span>

                    <input
                      type="number"
                      name="processing_fee_percent"
                      min="0"
                      step="0.01"
                      defaultValue={
                        product.processing_fee_percent ??
                        10
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>LINKS</span>

                  <h2>
                    Product links
                  </h2>

                  <p>
                    Update the product image and
                    live demo destinations.
                  </p>
                </div>

                <div className="store-admin-form-fields">
                  <label className="store-admin-field">
                    <span>
                      Image URL
                    </span>

                    <input
                      type="url"
                      name="image_url"
                      defaultValue={
                        product.image_url ??
                        ""
                      }
                      placeholder="https://..."
                    />
                  </label>

                  <label className="store-admin-field">
                    <span>
                      Live demo URL
                    </span>

                    <input
                      type="url"
                      name="demo_url"
                      defaultValue={
                        product.demo_url ??
                        ""
                      }
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

                  <h2>
                    Product setup
                  </h2>
                </div>

                <div className="store-admin-form-fields">
                  <label className="store-admin-field">
                    <span>
                      Product type
                    </span>

                    <select
                      name="product_type"
                      defaultValue={
                        product.product_type
                      }
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
                    <span>
                      Delivery method
                    </span>

                    <select
                      name="delivery_method"
                      defaultValue={
                        product.delivery_method
                      }
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
                    <span>
                      Display order
                    </span>

                    <input
                      type="number"
                      name="display_order"
                      min="0"
                      step="1"
                      defaultValue={
                        product.display_order ??
                        0
                      }
                    />

                    <small>
                      Lower numbers appear first.
                    </small>
                  </label>
                </div>
              </section>

              <section className="store-admin-form-card">
                <div className="store-admin-form-card-heading">
                  <span>
                    VISIBILITY
                  </span>

                  <h2>
                    Store status
                  </h2>
                </div>

                <div className="store-admin-toggle-list">
                  <label className="store-admin-checkbox">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={
                        product.is_active
                      }
                    />

                    <span>
                      <strong>
                        Active
                      </strong>

                      <small>
                        Show this product publicly
                        in the store.
                      </small>
                    </span>
                  </label>

                  <label className="store-admin-checkbox">
                    <input
                      type="checkbox"
                      name="is_featured"
                      defaultChecked={
                        product.is_featured
                      }
                    />

                    <span>
                      <strong>
                        Featured
                      </strong>

                      <small>
                        Highlight this product in
                        featured sections.
                      </small>
                    </span>
                  </label>
                </div>
              </section>

              <section className="store-admin-save-card">
                <p>
                  Saving will update this product
                  in your Supabase catalog.
                </p>

                <button
                  className="store-admin-save-product"
                  type="submit"
                >
                  Save Changes
                  <span>→</span>
                </button>

                <a href="/admin/products">
                  Cancel
                </a>
              </section>
            </aside>
          </form>

          <section className="store-admin-danger-zone">
            <div>
              <span>
                DANGER ZONE
              </span>

              <h2>
                Delete product
              </h2>

              <p>
                Permanently delete this product
                from the catalog. This action
                cannot be undone.
              </p>
            </div>

            <form action={deleteProduct}>
              <input
                type="hidden"
                name="product_id"
                value={product.id}
              />

              <button
                type="submit"
                className="store-admin-delete-product"
              >
                Delete Product
              </button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}