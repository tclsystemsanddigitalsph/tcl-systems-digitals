import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import styles from "./dashboard.module.css";
import { orderNetRevenue } from "@/lib/revenue";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function providerLabel(value: string | null) {
  if (!value) return "—";

  const labels: Record<string, string> = {
    PAYPAL: "PayPal",
    PAYMONGO: "PayMongo",
    GCASH: "GCash",
    MAYA: "Maya",
    BANK_TRANSFER: "Bank Transfer",
    CASH: "Cash",
    ETSY: "Etsy",
    MANUAL: "Manual",
  };

  return labels[value.toUpperCase()] ?? value;
}

function sourceLabel(value: string | null) {
  if (!value || value === "WEBSITE") return "Website";

  const labels: Record<string, string> = {
    MANUAL: "Manual",
    FACEBOOK: "Facebook",
    INSTAGRAM: "Instagram",
    TELEGRAM: "Telegram",
    ETSY: "Etsy",
    OTHER: "Other",
  };

  return labels[value.toUpperCase()] ?? value;
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
    ordersResult,
    recentOrdersResult,
    productsResult,
    deliveriesResult,
    quotationsResult,
    projectRequirementsResult,
  ] = await Promise.all([
    adminSupabase
      .from("orders")
      .select(
        "id,customer_email,total_amount,payment_status,delivery_status,refund_status,refunded_amount",
      ),

    adminSupabase
      .from("orders")
      .select(
        "id,order_number,customer_name,customer_email,product_name,total_amount,currency,payment_provider,payment_status,delivery_status,created_at,order_source",
      )
      .order("created_at", { ascending: false })
      .limit(6),

    adminSupabase
      .from("products")
      .select("id,is_active"),

    adminSupabase
      .from("delivery_requests")
      .select("id,status"),

    adminSupabase
      .from("quotation_requests")
      .select("id,status"),

    adminSupabase
      .from("project_requirements")
      .select("id,requirements_status,project_status"),
  ]);

  if (ordersResult.error) {
    console.error("Dashboard orders error:", ordersResult.error);
  }

  if (recentOrdersResult.error) {
    console.error("Dashboard recent orders error:", recentOrdersResult.error);
  }

  if (productsResult.error) {
    console.error("Dashboard products error:", productsResult.error);
  }

  if (deliveriesResult.error) {
    console.error("Dashboard deliveries error:", deliveriesResult.error);
  }

  if (quotationsResult.error) {
    console.error("Dashboard quotations error:", quotationsResult.error);
  }

  if (projectRequirementsResult.error) {
    console.error(
      "Dashboard project requirements error:",
      projectRequirementsResult.error,
    );
  }

  const orders = ordersResult.data ?? [];
  const recentOrders = recentOrdersResult.data ?? [];
  const products = productsResult.data ?? [];
  const deliveries = deliveriesResult.data ?? [];
  const quotations = quotationsResult.data ?? [];
  const projectRequirements = projectRequirementsResult.data ?? [];

  const completedOrders = orders.filter(
    (order) => order.payment_status === "COMPLETED",
  );

  const totalRevenue = orders.reduce(
    (sum, order) => sum + orderNetRevenue(order),
    0,
  );

  const pendingOrders = orders.filter(
    (order) => order.payment_status === "PENDING",
  ).length;

  const uniqueCustomers = new Set(
    orders
      .map((order) => order.customer_email?.toLowerCase())
      .filter(Boolean),
  ).size;

  const activeProducts = products.filter(
    (product) => product.is_active,
  ).length;

  const pendingDeliveries = deliveries.filter(
    (delivery) =>
      delivery.status === "PENDING" ||
      delivery.status === "IN_PROGRESS",
  ).length;

  const pendingQuotations = quotations.filter(
    (quotation) =>
      quotation.status === "NEW" ||
      quotation.status === "REVIEWING",
  ).length;

  const pendingProjectRequirements = projectRequirements.filter(
    (item) =>
      item.requirements_status === "SUBMITTED" ||
      item.requirements_status === "RESUBMITTED" ||
      item.requirements_status === "NEED_MORE_INFO" ||
      item.project_status === "REVIEWING",
  ).length;

  void completedOrders;

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="dashboard" email={user.email} />

        <section className="store-admin-main">
          <header className={styles.topbar}>
            <div>
              <span className="store-admin-eyebrow">
                STORE OVERVIEW
              </span>

              <h1>Dashboard</h1>

              <p>
                Track sales, orders, customers, products, fulfillment,
                quotation requests, and project requirements.
              </p>
            </div>

            <div className={styles.topbarActions}>
              <a className={styles.primaryButton} href="/admin/orders/new">
                + Add Order
              </a>

              <a className={styles.secondaryButton} href="/">
                View Store
              </a>
            </div>
          </header>

          <section className={styles.stats}>
            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>REVENUE</span>
                <i>₱</i>
              </div>

              <strong className={styles.moneyStat}>
                {formatMoney(totalRevenue)}
              </strong>

              <small>
                Net collected revenue after recorded refunds
              </small>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>ORDERS</span>
                <i>▣</i>
              </div>

              <strong>{orders.length}</strong>

              <small>
                {pendingOrders} currently pending
              </small>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>CUSTOMERS</span>
                <i>♡</i>
              </div>

              <strong>{uniqueCustomers}</strong>

              <small>
                Unique customer emails
              </small>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>PRODUCTS</span>
                <i>◇</i>
              </div>

              <strong>{activeProducts}</strong>

              <small>
                {products.length} total{" "}
                {products.length === 1 ? "product" : "products"}
              </small>
            </article>
          </section>

          <section
            className={`${styles.deliveryCard} ${styles.mobilePendingDelivery}`}
          >
            <div>
              <span>PENDING DELIVERY</span>

              <strong>{pendingDeliveries}</strong>

              <p>
                Delivery requests that still need attention.
              </p>
            </div>

            <a href="/admin/deliveries">
              Open Deliveries →
            </a>
          </section>

          <section className={styles.dashboardGrid}>
            <section className={styles.ordersPanel}>
              <div className={styles.panelHeader}>
                <div>
                  <span>RECENT ACTIVITY</span>
                  <h2>Recent orders</h2>
                  <p>Latest website and manual transactions.</p>
                </div>

                <a href="/admin/orders">
                  View all orders →
                </a>
              </div>

              {recentOrders.length > 0 ? (
                <div className={styles.transactions}>
                  {recentOrders.map((order) => (
                    <a
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className={styles.transactionCard}
                    >
                      <div className={styles.transactionTop}>
                        <div className={styles.customerBlock}>
                          <div className={styles.avatar}>
                            {order.customer_name
                              ?.charAt(0)
                              .toUpperCase() || "C"}
                          </div>

                          <div className={styles.customerText}>
                            <strong>{order.customer_name || "Customer"}</strong>
                            <span>{order.customer_email}</span>
                          </div>
                        </div>

                        <span
                          className={`${styles.status} ${
                            order.payment_status === "COMPLETED"
                              ? styles.completed
                              : order.payment_status === "PENDING"
                                ? styles.pending
                                : styles.muted
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </div>

                      <div className={styles.transactionMiddle}>
                        <div className={styles.productBlock}>
                          <span>PRODUCT</span>
                          <strong>{order.product_name}</strong>
                        </div>

                        <div className={styles.amountBlock}>
                          <span>AMOUNT</span>
                          <strong>
                            {formatMoney(
                              Number(order.total_amount ?? 0),
                            )}
                          </strong>
                        </div>
                      </div>

                      <div className={styles.transactionBottom}>
                        <div>
                          <span className={styles.metaLabel}>ORDER</span>
                          <strong>{order.order_number}</strong>
                        </div>

                        <div>
                          <span className={styles.metaLabel}>SOURCE</span>
                          <strong>{sourceLabel(order.order_source)}</strong>
                        </div>

                        <div>
                          <span className={styles.metaLabel}>PAYMENT</span>
                          <strong>{providerLabel(order.payment_provider)}</strong>
                        </div>

                        <div>
                          <span className={styles.metaLabel}>DATE</span>
                          <strong>{formatDate(order.created_at)}</strong>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  <div>▣</div>
                  <strong>No orders yet</strong>
                  <p>
                    New customer orders will appear here.
                  </p>
                </div>
              )}
            </section>

            <aside className={styles.sideColumn}>
              <section
                className={`${styles.quickCard} ${styles.mobileQuickActions}`}
              >
                <span>QUICK ACTIONS</span>
                <h2>Manage your store</h2>

                <div className={styles.quickLinks}>
                  <a href="/admin/orders/new">
                    <i>＋</i>
                    <div>
                      <strong>Add order</strong>
                      <small>
                        Log an off-platform or manual sale.
                      </small>
                    </div>
                    <b>→</b>
                  </a>

                  <a href="/admin/products/new">
                    <i>◇</i>
                    <div>
                      <strong>Add product</strong>
                      <small>
                        Create a new digital product.
                      </small>
                    </div>
                    <b>→</b>
                  </a>

                  <a href="/admin/products">
                    <i>✎</i>
                    <div>
                      <strong>Manage products</strong>
                      <small>
                        Edit pricing, files, and visibility.
                      </small>
                    </div>
                    <b>→</b>
                  </a>

                  <a href="/admin/quotation-requests">
                    <i>♡</i>
                    <div>
                      <strong>Quotation requests</strong>
                      <small>
                        {pendingQuotations}{" "}
                        {pendingQuotations === 1
                          ? "request needs"
                          : "requests need"}{" "}
                        review.
                      </small>
                    </div>
                    <b>→</b>
                  </a>

                  <a href="/admin/project-requirements">
                    <i>◈</i>
                    <div>
                      <strong>Project requirements</strong>
                      <small>
                        {pendingProjectRequirements}{" "}
                        {pendingProjectRequirements === 1
                          ? "project needs"
                          : "projects need"}{" "}
                        attention.
                      </small>
                    </div>
                    <b>→</b>
                  </a>

                  <a href="/admin/orders">
                    <i>▣</i>
                    <div>
                      <strong>View all orders</strong>
                      <small>
                        Review payments and fulfillment.
                      </small>
                    </div>
                    <b>→</b>
                  </a>
                </div>
              </section>

              <section
                className={`${styles.deliveryCard} ${styles.desktopPendingDelivery}`}
              >
                <div>
                  <span>PENDING DELIVERY</span>

                  <strong>{pendingDeliveries}</strong>

                  <p>
                    Delivery requests that still need attention.
                  </p>
                </div>

                <a href="/admin/deliveries">
                  Open Deliveries →
                </a>
              </section>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}
