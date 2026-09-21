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
      `,
    )
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Products page error:", error);
  }

  const productList = products ?? [];
  const activeCount = productList.filter((product) => product.is_active).length;
  const featuredCount = productList.filter(
    (product) => product.is_featured,
  ).length;
  const inactiveCount = productList.length - activeCount;

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="products" email={user.email} />

        <section className="store-admin-main">
          <div className={styles.page}>
            <header className={styles.topbar}>
              <div>
                <span className="store-admin-eyebrow">STORE MANAGEMENT</span>
                <h1>Products</h1>
                <p>Manage your storefront catalog, pricing, and availability.</p>
              </div>

              <a className={styles.addButton} href="/admin/products/new">
                + Add Product
              </a>
            </header>

            <section className={styles.stats}>
              <div>
                <span>TOTAL PRODUCTS</span>
                <strong>{productList.length}</strong>
              </div>
              <div className={styles.statFocus}>
                <span>ACTIVE</span>
                <strong>{activeCount}</strong>
              </div>
              <div>
                <span>FEATURED</span>
                <strong>{featuredCount}</strong>
              </div>
              <div>
                <span>INACTIVE</span>
                <strong>{inactiveCount}</strong>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span>CATALOG</span>
                  <h2>All products</h2>
                </div>
                <small>
                  {productList.length}{" "}
                  {productList.length === 1 ? "product" : "products"}
                </small>
              </div>

              {productList.length > 0 ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Delivery</th>
                        <th>Status</th>
                        <th>Featured</th>
                        <th aria-label="Actions" />
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
                              <div className={styles.productIdentity}>
                                <div>
                                  <strong>{product.name}</strong>
                                  <span>{product.category || "Uncategorized"}</span>
                                </div>
                                <small>/{product.slug}</small>
                              </div>
                            </td>

                            <td>
                              <span className={styles.neutralPill}>
                                {product.product_type}
                              </span>
                            </td>

                            <td>
                              <div className={styles.priceCell}>
                                <strong>{formatMoney(displayPrice)}</strong>

                                {product.sale_price !== null ? (
                                  <small>
                                    Regular{" "}
                                    {formatMoney(Number(product.price || 0))}
                                  </small>
                                ) : null}

                                <small>
                                  +{product.processing_fee_percent}% fee
                                </small>
                              </div>
                            </td>

                            <td>
                              <span className={styles.neutralPill}>
                                {product.delivery_method}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`${styles.statusPill} ${
                                  product.is_active
                                    ? styles.active
                                    : styles.inactive
                                }`}
                              >
                                {product.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>

                            <td>
                              {product.is_featured ? (
                                <span
                                  className={`${styles.statusPill} ${styles.featured}`}
                                >
                                  Featured
                                </span>
                              ) : (
                                <span className={styles.muted}>—</span>
                              )}
                            </td>

                            <td className={styles.actionCell}>
                              <a href={`/admin/products/${product.id}`}>
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
                <div className={styles.emptyState}>
                  <strong>No products yet</strong>
                  <p>Add your first product to start building the catalog.</p>
                  <a href="/admin/products/new">+ Add Product</a>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
