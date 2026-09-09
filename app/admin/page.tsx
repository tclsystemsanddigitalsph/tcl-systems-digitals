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
        "id,customer_email,product_id,total_amount,payment_status,order_status,delivery_status,refund_status,refunded_amount,download_access_expires_at",
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
      .select("id,is_active,product_type,delivery_method"),

    adminSupabase
      .from("delivery_requests")
      .select("id,status"),

    adminSupabase
      .from("quotation_requests")
      .select("id,status"),

    adminSupabase
      .from("project_requirements")
      .select("id,order_id,requirements_status,project_status"),
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

  const orderMap = new Map(orders.map((order) => [order.id, order]));
  const productMap = new Map(products.map((product) => [product.id, product]));

  const paidOrdersToReview = orders.filter(
    (order) =>
      order.payment_status === "COMPLETED" &&
      order.order_status !== "CANCELLED" &&
      (order.delivery_status === "NOT_STARTED" ||
        order.delivery_status === "PENDING" ||
        !order.delivery_status),
  ).length;

  const submittedRequirements = projectRequirements.filter(
    (item) =>
      item.requirements_status === "SUBMITTED" ||
      item.requirements_status === "RESUBMITTED",
  ).length;

  const needsMoreInfo = projectRequirements.filter(
    (item) => item.requirements_status === "NEED_MORE_INFO",
  ).length;

  const projectsInProgress = projectRequirements.filter(
    (item) =>
      item.project_status === "IN_PROGRESS" ||
      item.project_status === "REVIEWING",
  ).length;

  const readyForDelivery = projectRequirements.filter((item) => {
    if (item.project_status !== "COMPLETED") return false;
    const linkedOrder = orderMap.get(item.order_id);
    return Boolean(
      linkedOrder &&
        linkedOrder.order_status !== "CANCELLED" &&
        linkedOrder.delivery_status !== "DELIVERED",
    );
  }).length;

  const now = Date.now();
  const digitalAccessIssues = orders.filter((order) => {
    if (order.payment_status !== "COMPLETED" || order.order_status === "CANCELLED") {
      return false;
    }

    const product = order.product_id ? productMap.get(order.product_id) : null;
    const productType = (product?.product_type || "").toUpperCase();
    const deliveryMethod = (product?.delivery_method || "").toUpperCase();
    const isDigital =
      productType === "DIGITAL" ||
      productType === "DIGITAL_PRODUCT" ||
      deliveryMethod.includes("DOWNLOAD");

    if (!isDigital) return false;
    if (!order.download_access_expires_at) return true;

    return new Date(order.download_access_expires_at).getTime() <= now;
  }).length;

  const refundOrCancellationCount = orders.filter(
    (order) =>
      order.order_status === "CANCELLED" ||
      order.refund_status === "PARTIALLY_REFUNDED" ||
      order.refund_status === "REFUNDED" ||
      Number(order.refunded_amount ?? 0) > 0,
  ).length;

  const attentionTotal =
    paidOrdersToReview +
    submittedRequirements +
    needsMoreInfo +
    readyForDelivery +
    digitalAccessIssues;

  void completedOrders;

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="dashboard" email={user.email} />

        <section className="store-admin-main">
          <header className={styles.heroHeader}>
            <div className={styles.heroCopy}>
              <span className="store-admin-eyebrow">STORE OVERVIEW</span>
              <h1>Your business, at a glance.</h1>
              <p>
                Keep an eye on sales, customer activity, project work, and the
                items that need your attention today.
              </p>
            </div>

            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="/admin/orders/new">
                + Add Order
              </a>
              <a className={styles.secondaryButton} href="/">
                View Store
              </a>
            </div>
          </header>

          <section className={styles.overviewBoard}>
            <article className={`${styles.metricCard} ${styles.revenueCard}`}>
              <div className={styles.metricLabel}>
                <span>NET REVENUE</span>
                <i>₱</i>
              </div>
              <strong className={styles.revenueValue}>{formatMoney(totalRevenue)}</strong>
              <small>After recorded refunds</small>
            </article>

            <article className={styles.metricCard}>
              <div className={styles.metricLabel}>
                <span>ORDERS</span>
                <i>▣</i>
              </div>
              <strong>{orders.length}</strong>
              <small>{pendingOrders} payment{pendingOrders === 1 ? "" : "s"} pending</small>
            </article>

            <article className={styles.metricCard}>
              <div className={styles.metricLabel}>
                <span>CUSTOMERS</span>
                <i>♡</i>
              </div>
              <strong>{uniqueCustomers}</strong>
              <small>Unique customer emails</small>
            </article>

            <article className={styles.metricCard}>
              <div className={styles.metricLabel}>
                <span>ACTIVE PRODUCTS</span>
                <i>◇</i>
              </div>
              <strong>{activeProducts}</strong>
              <small>{products.length} total product{products.length === 1 ? "" : "s"}</small>
            </article>
          </section>

          <section className={styles.workspaceGrid}>
            <section className={styles.attentionPanel}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>NEEDS ATTENTION</span>
                  <h2>What needs you right now</h2>
                  <p>Only the items that may need a review, update, or next step.</p>
                </div>
                <div className={styles.attentionBubble}>
                  <strong>{attentionTotal}</strong>
                  <span>active</span>
                </div>
              </div>

              <div className={styles.attentionList}>
                <a className={styles.attentionRow} href="/admin/orders">
                  <div className={styles.rowIcon}>₱</div>
                  <div className={styles.rowCopy}>
                    <strong>Paid orders to review</strong>
                    <span>Completed payments waiting for fulfillment progress.</span>
                  </div>
                  <b>{paidOrdersToReview}</b>
                  <i>→</i>
                </a>

                <a className={styles.attentionRow} href="/admin/project-requirements">
                  <div className={styles.rowIcon}>✓</div>
                  <div className={styles.rowCopy}>
                    <strong>Requirements submitted</strong>
                    <span>New or resubmitted requirements ready for review.</span>
                  </div>
                  <b>{submittedRequirements}</b>
                  <i>→</i>
                </a>

                <a className={styles.attentionRow} href="/admin/project-requirements">
                  <div className={styles.rowIcon}>?</div>
                  <div className={styles.rowCopy}>
                    <strong>Needs more info</strong>
                    <span>Projects currently waiting on customer details.</span>
                  </div>
                  <b>{needsMoreInfo}</b>
                  <i>→</i>
                </a>

                <a className={styles.attentionRow} href="/admin/project-requirements">
                  <div className={styles.rowIcon}>◈</div>
                  <div className={styles.rowCopy}>
                    <strong>Projects in progress</strong>
                    <span>Customized projects being reviewed or built.</span>
                  </div>
                  <b>{projectsInProgress}</b>
                  <i>→</i>
                </a>

                <a className={styles.attentionRow} href="/admin/project-requirements">
                  <div className={styles.rowIcon}>→</div>
                  <div className={styles.rowCopy}>
                    <strong>Ready for delivery</strong>
                    <span>Completed projects not yet marked delivered.</span>
                  </div>
                  <b>{readyForDelivery}</b>
                  <i>→</i>
                </a>

                <a className={styles.attentionRow} href="/admin/orders">
                  <div className={styles.rowIcon}>↓</div>
                  <div className={styles.rowCopy}>
                    <strong>Digital access issues</strong>
                    <span>Paid digital orders with missing or expired access.</span>
                  </div>
                  <b>{digitalAccessIssues}</b>
                  <i>→</i>
                </a>

                <a className={`${styles.attentionRow} ${styles.exceptionRow}`} href="/admin/orders">
                  <div className={styles.rowIcon}>!</div>
                  <div className={styles.rowCopy}>
                    <strong>Refunds / cancellations</strong>
                    <span>Orders with a cancellation or recorded refund.</span>
                  </div>
                  <b>{refundOrCancellationCount}</b>
                  <i>→</i>
                </a>
              </div>
            </section>

            <section className={styles.activityPanel}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>RECENT ACTIVITY</span>
                  <h2>Latest orders</h2>
                  <p>Your newest website and manual transactions.</p>
                </div>
                <a className={styles.textLink} href="/admin/orders">View all →</a>
              </div>

              {recentOrders.length > 0 ? (
                <div className={styles.orderList}>
                  {recentOrders.map((order) => (
                    <a key={order.id} href={`/admin/orders/${order.id}`} className={styles.orderRow}>
                      <div className={styles.orderAvatar}>
                        {order.customer_name?.charAt(0).toUpperCase() || "C"}
                      </div>

                      <div className={styles.orderIdentity}>
                        <strong>{order.customer_name || "Customer"}</strong>
                        <span>{order.product_name}</span>
                        <small>{order.order_number}</small>
                      </div>

                      <div className={styles.orderMeta}>
                        <span>{sourceLabel(order.order_source)}</span>
                        <small>{formatDate(order.created_at)}</small>
                      </div>

                      <div className={styles.orderPayment}>
                        <strong>{formatMoney(Number(order.total_amount ?? 0))}</strong>
                        <small>{providerLabel(order.payment_provider)}</small>
                      </div>

                      <span className={`${styles.status} ${
                        order.payment_status === "COMPLETED"
                          ? styles.completed
                          : order.payment_status === "PENDING"
                            ? styles.pending
                            : styles.muted
                      }`}>
                        {order.payment_status}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div>▣</div>
                  <strong>No orders yet</strong>
                  <p>New customer orders will appear here.</p>
                </div>
              )}
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}
