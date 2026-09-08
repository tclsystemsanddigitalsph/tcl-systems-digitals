import AdminNav from "@/app/admin/AdminNav";
import styles from "./products.module.css";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function AdminProductsPage() {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminSupabase = createAdminSupabaseClient();

  const { data: products, error } = await adminSupabase
    .from("products")
    .select(
      `
        id,
        name,
        slug,
        short_description,
        category,
        product_type,
        price,
        sale_price,
        processing_fee_percent,
        badge,
        delivery_method,
        is_active,
        is_featured,
        display_order,
        created_at
      `
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Products page error:", error);
  }

  const productList = products ?? [];

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="products" email={user.email} />

        <section className="store-admin-main">
          <header className={styles.topbar}>
            <div>
              <span className="store-admin-eyebrow">
                STORE MANAGEMENT
              </span>

              <h1>Products</h1>

              <p>
                Manage everything you sell from your TCL storefront.
              </p>
            </div>

            <div className={styles.topbarActions}>
<a
                className="store-admin-add-product-button"
                href="/admin/products/new"
              >
                + Add Product
              </a>
            </div>
          </header>

          <section className="store-admin-products-summary">
            <article>
              <span>Total Products</span>
              <strong>{productList.length}</strong>
            </article>

            <article>
              <span>Active</span>
              <strong>
                {
                  productList.filter(
                    (product) => product.is_active
                  ).length
                }
              </strong>
            </article>

            <article>
              <span>Featured</span>
              <strong>
                {
                  productList.filter(
                    (product) => product.is_featured
                  ).length
                }
              </strong>
            </article>

            <article>
              <span>Inactive</span>
              <strong>
                {
                  productList.filter(
                    (product) => !product.is_active
                  ).length
                }
              </strong>
            </article>
          </section>

          <section className="store-admin-panel store-admin-products-page-panel">
            <div className="store-admin-panel-heading">
              <div>
                <span>CATALOG</span>
                <h2>All products</h2>
              </div>

              <div className="store-admin-product-count">
                {productList.length}{" "}
                {productList.length === 1
                  ? "product"
                  : "products"}
              </div>
            </div>

            {productList.length > 0 ? (
              <div className="store-admin-products-table-wrap">
                <table className="store-admin-products-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Delivery</th>
                      <th>Status</th>
                      <th>Featured</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {productList.map((product) => {
                      const displayPrice =
                        product.sale_price !== null
                          ? Number(product.sale_price)
                          : Number(product.price || 0);

                      return (
                        <tr key={product.id}>
                          <td>
                            <div className="store-admin-product-table-name">
                              <div className="store-admin-product-table-icon">
                                ◇
                              </div>

                              <div>
                                <strong>
                                  {product.name}
                                </strong>

                                <span>
                                  {product.category}
                                </span>

                                <small>
                                  /{product.slug}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="store-admin-table-pill">
                              {product.product_type}
                            </span>
                          </td>

                          <td>
                            <div className="store-admin-product-price-cell">
                              <strong>
                                {formatMoney(displayPrice)}
                              </strong>

                              {product.sale_price !== null ? (
                                <small>
                                  Regular{" "}
                                  {formatMoney(
                                    Number(
                                      product.price || 0
                                    )
                                  )}
                                </small>
                              ) : null}

                              <small>
                                +{" "}
                                {
                                  product.processing_fee_percent
                                }
                                % fee
                              </small>
                            </div>
                          </td>

                          <td>
                            <span className="store-admin-table-pill">
                              {product.delivery_method}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                product.is_active
                                  ? "store-admin-product-active"
                                  : "store-admin-product-inactive"
                              }
                            >
                              {product.is_active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          <td>
                            {product.is_featured ? (
                              <span className="store-admin-featured-badge">
                                Featured
                              </span>
                            ) : (
                              <span className="store-admin-muted-status">
                                —
                              </span>
                            )}
                          </td>

                          <td>
                            <a
                              className="store-admin-edit-product-button"
                              href={`/admin/products/${product.id}`}
                            >
                              Edit →
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="store-admin-empty-state">
                <div>◇</div>

                <strong>No products yet</strong>

                <p>
                  Add your first product and it will appear
                  here.
                </p>

                <a
                  className="store-admin-empty-add-button"
                  href="/admin/products/new"
                >
                  + Add Product
                </a>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}