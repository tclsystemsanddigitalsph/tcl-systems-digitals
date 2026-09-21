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
    BPI: "BPI",
    GCASH: "GCash",
    MAYA: "Maya",
    BANK_TRANSFER: "Bank Transfer",
    CASH: "Cash",
    ETSY: "Etsy",
    MANUAL: "Manual",
  };

  return labels[value.toUpperCase()] ?? value;
}

function paymentLabel(value: string | null) {
  if (!value) return "Unknown";
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ");
}

function progressLabel(value: string | null) {
  switch ((value || "PENDING").toUpperCase()) {
    case "IN_PROGRESS":
      return "In Progress";
    case "READY_FOR_DELIVERY":
      return "Ready";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Pending";
  }
}

export default async function AdminDashboardPage() {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const adminSupabase = createAdminSupabaseClient();

  const [
    ordersResult,
    recentOrdersResult,
    quotationsResult,
    requirementsResult,
    bpiProofsResult,
  ] = await Promise.all([
    adminSupabase
      .from("orders")
      .select(
        "id,customer_email,total_amount,payment_status,order_status,refund_status,refunded_amount",
      ),

    adminSupabase
      .from("orders")
      .select(
        "id,order_number,customer_name,product_name,total_amount,payment_provider,payment_status,order_status,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(7),

    adminSupabase.from("quotation_requests").select("id,status"),

    adminSupabase
      .from("project_requirements")
      .select("id,requirements_status,project_status"),

    adminSupabase
      .from("bank_transfer_proofs")
      .select("id,order_id,status")
      .eq("status", "PENDING"),
  ]);

  if (ordersResult.error) {
    console.error("Dashboard orders error:", ordersResult.error);
  }
  if (recentOrdersResult.error) {
    console.error("Dashboard recent orders error:", recentOrdersResult.error);
  }
  if (quotationsResult.error) {
    console.error("Dashboard quotations error:", quotationsResult.error);
  }
  if (requirementsResult.error) {
    console.error("Dashboard project requirements error:", requirementsResult.error);
  }
  if (bpiProofsResult.error) {
    console.error("Dashboard BPI proofs error:", bpiProofsResult.error);
  }

  const orders = ordersResult.data ?? [];
  const recentOrders = recentOrdersResult.data ?? [];
  const quotations = quotationsResult.data ?? [];
  const requirements = requirementsResult.data ?? [];
  const pendingBpiProofs = bpiProofsResult.data ?? [];

  const totalRevenue = orders.reduce(
    (sum, order) => sum + orderNetRevenue(order),
    0,
  );

  const pendingPayments = orders.filter(
    (order) => order.payment_status === "PENDING",
  ).length;

  const activeProjects = orders.filter(
    (order) =>
      order.order_status === "IN_PROGRESS" ||
      order.order_status === "READY_FOR_DELIVERY",
  ).length;

  const newQuotations = quotations.filter(
    (quotation) =>
      quotation.status === "NEW" || quotation.status === "REVIEWING",
  ).length;

  const submittedRequirements = requirements.filter(
    (item) =>
      item.requirements_status === "SUBMITTED" ||
      item.requirements_status === "RESUBMITTED",
  ).length;

  const readyForDelivery = orders.filter(
    (order) => order.order_status === "READY_FOR_DELIVERY",
  ).length;

  const paymentProofsToVerify = pendingBpiProofs.length;

  const actionTotal =
    paymentProofsToVerify +
    newQuotations +
    submittedRequirements +
    readyForDelivery;

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="dashboard" email={user.email} />

        <section className="store-admin-main">
          <header className={styles.header}>
            <div>
              <span className="store-admin-eyebrow">ADMIN OVERVIEW</span>
              <h1>Dashboard</h1>
              <p>Sales, projects, and the items that need action.</p>
            </div>

            <div className={styles.headerActions}>
              <a className={styles.secondaryButton} href="/admin/orders">
                View orders
              </a>
              <a className={styles.primaryButton} href="/admin/orders/new">
                + Add order
              </a>
            </div>
          </header>

          <section className={styles.metrics}>
            <article>
              <span>NET REVENUE</span>
              <strong>{formatMoney(totalRevenue)}</strong>
              <small>After recorded refunds</small>
            </article>

            <article>
              <span>TOTAL ORDERS</span>
              <strong>{orders.length}</strong>
              <small>All recorded orders</small>
            </article>

            <article>
              <span>PENDING PAYMENTS</span>
              <strong>{pendingPayments}</strong>
              <small>Awaiting completion or verification</small>
            </article>

            <article>
              <span>ACTIVE PROJECTS</span>
              <strong>{activeProjects}</strong>
              <small>In progress or ready to deliver</small>
            </article>
          </section>

          <section className={styles.mainGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeading}>
                <div>
                  <span>ACTION CENTER</span>
                  <h2>Needs attention</h2>
                </div>
                <strong className={styles.actionCount}>{actionTotal}</strong>
              </div>

              <div className={styles.actionList}>
                <a href="/admin/orders" className={styles.actionRow}>
                  <div>
                    <strong>Payment verification</strong>
                    <span>Pending BPI proofs to review</span>
                  </div>
                  <b>{paymentProofsToVerify}</b>
                  <i>→</i>
                </a>

                <a
                  href="/admin/quotation-requests"
                  className={styles.actionRow}
                >
                  <div>
                    <strong>Quotation requests</strong>
                    <span>New or currently under review</span>
                  </div>
                  <b>{newQuotations}</b>
                  <i>→</i>
                </a>

                <a
                  href="/admin/project-requirements"
                  className={styles.actionRow}
                >
                  <div>
                    <strong>Requirements submitted</strong>
                    <span>Customer submissions ready for review</span>
                  </div>
                  <b>{submittedRequirements}</b>
                  <i>→</i>
                </a>

                <a
                  href="/admin/orders?progress=READY_FOR_DELIVERY"
                  className={styles.actionRow}
                >
                  <div>
                    <strong>Ready for delivery</strong>
                    <span>Orders waiting for the final delivery step</span>
                  </div>
                  <b>{readyForDelivery}</b>
                  <i>→</i>
                </a>
              </div>
            </section>

            <section className={`${styles.panel} ${styles.recentPanel}`}>
              <div className={styles.panelHeading}>
                <div>
                  <span>RECENT ORDERS</span>
                  <h2>Latest activity</h2>
                </div>
                <a href="/admin/orders">View all →</a>
              </div>

              {recentOrders.length > 0 ? (
                <div className={styles.tableWrap}>
                  <table className={styles.ordersTable}>
                    <thead>
                      <tr>
                        <th>Customer / Order</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Progress</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <strong>{order.customer_name || "Customer"}</strong>
                            <small>
                              {order.order_number} · {formatDate(order.created_at)}
                            </small>
                          </td>
                          <td>
                            <strong>{order.product_name}</strong>
                            <small>{providerLabel(order.payment_provider)}</small>
                          </td>
                          <td className={styles.amount}>
                            {formatMoney(Number(order.total_amount ?? 0))}
                          </td>
                          <td>
                            <span
                              className={`${styles.pill} ${
                                order.payment_status === "COMPLETED"
                                  ? styles.success
                                  : order.payment_status === "PENDING"
                                    ? styles.warning
                                    : styles.neutral
                              }`}
                            >
                              {paymentLabel(order.payment_status)}
                            </span>
                          </td>
                          <td>
                            <span className={`${styles.pill} ${styles.progress}`}>
                              {progressLabel(order.order_status)}
                            </span>
                          </td>
                          <td className={styles.openCell}>
                            <a href={`/admin/orders/${order.id}`}>Open →</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <strong>No orders yet</strong>
                  <p>New orders will appear here.</p>
                </div>
              )}
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}
