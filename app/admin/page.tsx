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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminSupabase = createAdminSupabaseClient();

  const [
    completedOrdersResult,
    totalOrdersResult,
    pendingDeliveriesResult,
    pendingReviewsResult,
    recentOrdersResult,
    productsResult,
  ] = await Promise.all([
    adminSupabase
      .from("orders")
      .select("total_amount")
      .eq("payment_status", "COMPLETED"),

    adminSupabase
      .from("orders")
      .select("id", { count: "exact", head: true }),

    adminSupabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("delivery_status", [
        "NOT_STARTED",
        "ACTION_REQUIRED",
        "PROCESSING",
      ])
      .eq("payment_status", "COMPLETED"),

    adminSupabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("status", "PENDING"),

    adminSupabase
      .from("orders")
      .select(
        `
          id,
          order_number,
          customer_name,
          customer_email,
          product_name,
          total_amount,
          currency,
          payment_status,
          delivery_status,
          created_at
        `
      )
      .order("created_at", { ascending: false })
      .limit(5),

    adminSupabase
      .from("products")
      .select(
        `
          id,
          name,
          slug,
          category,
          price,
          sale_price,
          is_active,
          is_featured,
          created_at
        `
      )
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const dashboardErrors = [
    completedOrdersResult.error,
    totalOrdersResult.error,
    pendingDeliveriesResult.error,
    pendingReviewsResult.error,
    recentOrdersResult.error,
    productsResult.error,
  ].filter(Boolean);

  if (dashboardErrors.length > 0) {
    console.error("Admin dashboard data error:", dashboardErrors);
  }

  const totalRevenue =
    completedOrdersResult.data?.reduce((sum, order) => {
      return sum + Number(order.total_amount || 0);
    }, 0) ?? 0;

  const totalOrders = totalOrdersResult.count ?? 0;
  const pendingDeliveries = pendingDeliveriesResult.count ?? 0;
  const pendingReviews = pendingReviewsResult.count ?? 0;
  const recentOrders = recentOrdersResult.data ?? [];
  const products = productsResult.data ?? [];

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
            <a className="active" href="/admin">
              <span>⌂</span>
              Dashboard
            </a>

            <a href="/admin/products">
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
    <span className="store-admin-eyebrow">
      PRODUCT CATALOG
    </span>

    <h1>Add Product</h1>

    <p>
      Create a new product for your TCL storefront.
    </p>
  </div>

  <div className="store-admin-topbar-actions">
    <a
      className="store-admin-view-store"
      href="/admin/products"
    >
      ← Back to Products
    </a>
  </div>
</header>

          <div className="store-admin-stats">
            <article>
              <div className="store-admin-stat-icon">
                ₱
              </div>

              <div>
                <span>Total Revenue</span>
                <strong>{formatMoney(totalRevenue)}</strong>

                <small>
                  Completed payments only
                </small>
              </div>
            </article>

            <article>
              <div className="store-admin-stat-icon">
                ♡
              </div>

              <div>
                <span>Total Orders</span>
                <strong>{totalOrders}</strong>

                <small>
                  All recorded store orders
                </small>
              </div>
            </article>

            <article>
              <div className="store-admin-stat-icon">
                ↗
              </div>

              <div>
                <span>Pending Delivery</span>
                <strong>{pendingDeliveries}</strong>

                <small>
                  Paid orders still requiring action
                </small>
              </div>
            </article>

            <article>
              <div className="store-admin-stat-icon">
                ☆
              </div>

              <div>
                <span>Pending Reviews</span>
                <strong>{pendingReviews}</strong>

                <small>
                  Customer reviews waiting for approval
                </small>
              </div>
            </article>
          </div>

          <div className="store-admin-dashboard-grid">
            <section className="store-admin-panel store-admin-recent-orders">
              <div className="store-admin-panel-heading">
                <div>
                  <span>ORDERS</span>
                  <h2>Recent orders</h2>
                </div>

                <a href="/admin/orders">
                  View all →
                </a>
              </div>

              {recentOrders.length > 0 ? (
                <div className="store-admin-order-list">
                  {recentOrders.map((order) => (
                    <a
                      className="store-admin-order-item"
                      href={`/admin/orders/${order.id}`}
                      key={order.id}
                    >
                      <div className="store-admin-order-main">
                        <div className="store-admin-order-avatar">
                          {order.customer_name
                            ?.charAt(0)
                            .toUpperCase() || "C"}
                        </div>

                        <div>
                          <strong>{order.customer_name}</strong>

                          <span>{order.product_name}</span>

                          <small>
                            {order.order_number} •{" "}
                            {formatDate(order.created_at)}
                          </small>
                        </div>
                      </div>

                      <div className="store-admin-order-side">
                        <strong>
                          {formatMoney(
                            Number(order.total_amount || 0)
                          )}
                        </strong>

                        <span
                          className={`store-admin-status store-admin-status-${order.payment_status.toLowerCase()}`}
                        >
                          {order.payment_status}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="store-admin-empty-state">
                  <div>♡</div>

                  <strong>No orders yet</strong>

                  <p>
                    Your latest customer purchases will appear here once
                    checkout is connected.
                  </p>
                </div>
              )}
            </section>

            <section className="store-admin-panel store-admin-actions-panel">
              <div className="store-admin-panel-heading">
                <div>
                  <span>SHORTCUTS</span>
                  <h2>Quick actions</h2>
                </div>
              </div>

              <div className="store-admin-quick-actions">
                <a href="/admin/products">
                  <span>＋</span>

                  <div>
                    <strong>Add a product</strong>
                    <small>
                      Create or manage store products
                    </small>
                  </div>

                  <i>→</i>
                </a>

                <a href="/admin/orders">
                  <span>▣</span>

                  <div>
                    <strong>View orders</strong>
                    <small>
                      Review customer purchases
                    </small>
                  </div>

                  <i>→</i>
                </a>

                <a href="/admin/reviews">
                  <span>☆</span>

                  <div>
                    <strong>Manage reviews</strong>
                    <small>
                      Approve customer feedback
                    </small>
                  </div>

                  <i>→</i>
                </a>

                <a href="/admin/settings">
                  <span>⚙</span>

                  <div>
                    <strong>Store settings</strong>
                    <small>
                      Update your business details
                    </small>
                  </div>

                  <i>→</i>
                </a>
              </div>
            </section>
          </div>

          <section className="store-admin-panel store-admin-products-overview">
            <div className="store-admin-panel-heading">
              <div>
                <span>PRODUCTS</span>
                <h2>Your store</h2>
              </div>

              <a href="/admin/products">
                Manage products →
              </a>
            </div>

            {products.length > 0 ? (
              <div className="store-admin-product-list">
                {products.map((product) => (
                  <a
                    className="store-admin-product-item"
                    href={`/admin/products/${product.id}`}
                    key={product.id}
                  >
                    <div className="store-admin-product-icon">
                      ◇
                    </div>

                    <div className="store-admin-product-copy">
                      <strong>{product.name}</strong>

                      <span>{product.category}</span>

                      <small>
                        {product.sale_price !== null
                          ? formatMoney(
                              Number(product.sale_price)
                            )
                          : formatMoney(
                              Number(product.price || 0)
                            )}
                      </small>
                    </div>

                    <div className="store-admin-product-meta">
                      {product.is_featured ? (
                        <span className="store-admin-featured-badge">
                          Featured
                        </span>
                      ) : null}

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
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="store-admin-products-empty">
                <div>
                  <span>◇</span>

                  <div>
                    <strong>
                      No products in Supabase yet
                    </strong>

                    <p>
                      Next we&apos;ll add your Editable Booking System to
                      the products database and build the product manager
                      so you can update it from Admin.
                    </p>
                  </div>
                </div>

                <a href="/admin/products">
                  Manage Products
                  <span>→</span>
                </a>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}