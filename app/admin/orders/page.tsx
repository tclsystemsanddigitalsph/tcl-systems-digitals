import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import styles from "./orders.module.css";

type OrdersPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    provider?: string;
    page?: string;
  }>;
};

type OrderSummaryRow = {
  total_amount: number | string | null;
  payment_status: string | null;
};

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  base_price: number | string | null;
  processing_fee: number | string | null;
  total_amount: number | string | null;
  currency: string | null;
  payment_provider: string | null;
  payment_status: string | null;
  delivery_status: string | null;
  paid_at: string | null;
  created_at: string;
  order_source: string | null;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  const authSupabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const query = await searchParams;
  const adminSupabase = createAdminSupabaseClient();
  const search = (query.q ?? "").trim();
  const status = (query.status ?? "ALL").toUpperCase();
  const provider = (query.provider ?? "ALL").toUpperCase();
  const requestedPage = Math.max(
    1,
    Number.parseInt(query.page ?? "1", 10) || 1,
  );
  const pageSize = 5;

  const applyFilters = (builder: any) => {
    let result = builder;

    if (status !== "ALL") result = result.eq("payment_status", status);
    if (provider !== "ALL") result = result.eq("payment_provider", provider);

    if (search) {
      const safeSearch = search.replace(/[%_]/g, "").replace(/,/g, " ");

      if (safeSearch) {
        result = result.or(
          `order_number.ilike.%${safeSearch}%,customer_name.ilike.%${safeSearch}%,customer_email.ilike.%${safeSearch}%,product_name.ilike.%${safeSearch}%`,
        );
      }
    }

    return result;
  };

  const countResult = await applyFilters(
    adminSupabase.from("orders").select("id", { count: "exact" }),
  ).range(0, 0);

  const totalFilteredOrders = countResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalFilteredOrders / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await applyFilters(
    adminSupabase
      .from("orders")
      .select(
        "id,order_number,customer_name,customer_email,product_name,base_price,processing_fee,total_amount,currency,payment_provider,payment_status,delivery_status,paid_at,created_at,order_source",
      ),
  )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) console.error("Admin orders load error:", error);

  const orders: OrderRow[] = (data ?? []) as OrderRow[];

  const { data: summaryData, error: summaryError } = await adminSupabase
    .from("orders")
    .select("total_amount,payment_status");

  if (summaryError) {
    console.error("Admin orders summary error:", summaryError);
  }

  const allOrders: OrderSummaryRow[] = summaryData ?? [];
  const completed = allOrders.filter(
    (order: OrderSummaryRow) => order.payment_status === "COMPLETED",
  );
  const revenue = completed.reduce(
    (sum: number, order: OrderSummaryRow) =>
      sum + Number(order.total_amount ?? 0),
    0,
  );
  const pending = allOrders.filter(
    (order: OrderSummaryRow) => order.payment_status === "PENDING",
  ).length;

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();

    if (search) params.set("q", search);
    if (status !== "ALL") params.set("status", status);
    if (provider !== "ALL") params.set("provider", provider);
    if (page > 1) params.set("page", String(page));

    const qs = params.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  };

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="orders" email={user.email} />

        <section className="store-admin-main">
          <header className={styles.topbar}>
            <div>
              <span className="store-admin-eyebrow">SALES &amp; PAYMENTS</span>
              <h1>Orders</h1>
              <p>Review website purchases and manually logged sales.</p>
            </div>

            <div className={styles.mobileTopActions}>
              <a className={styles.backButton} href="/admin/orders/new">
                + Add Order
              </a>
              <a className={styles.backButton} href="/admin">
                ← Dashboard
              </a>
            </div>
          </header>

          <section className={styles.summaryGrid}>
            <article>
              <span>TOTAL ORDERS</span>
              <strong>{allOrders.length}</strong>
              <small>All recorded orders</small>
            </article>
            <article>
              <span>COMPLETED</span>
              <strong>{completed.length}</strong>
              <small>Verified / logged payments</small>
            </article>
            <article>
              <span>PENDING</span>
              <strong>{pending}</strong>
              <small>Waiting for confirmation</small>
            </article>
            <article>
              <span>REVENUE</span>
              <strong>{formatMoney(revenue)}</strong>
              <small>Completed orders only</small>
            </article>
          </section>

          <section className={styles.ordersPanel}>
            <div className={styles.panelHeader}>
              <div>
                <span>ORDER HISTORY</span>
                <h2>All orders</h2>
              </div>
              <small>
                Showing {totalFilteredOrders === 0 ? 0 : from + 1}–
                {Math.min(to + 1, totalFilteredOrders)} of {totalFilteredOrders}
              </small>
            </div>

            <form
              className={styles.filters}
              method="GET"
              action="/admin/orders"
            >
              <label className={styles.searchBox}>
                <span>⌕</span>
                <input
                  type="search"
                  name="q"
                  defaultValue={query.q ?? ""}
                  placeholder="Search order, customer, email or product..."
                />
              </label>

              <select
                name="status"
                defaultValue={status}
                aria-label="Payment status"
              >
                <option value="ALL">All statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                name="provider"
                defaultValue={provider}
                aria-label="Payment provider"
              >
                <option value="ALL">All providers</option>
                <option value="PAYPAL">PayPal</option>
                <option value="PAYMONGO">PayMongo</option>
                <option value="MANUAL">Manual / Other</option>
                <option value="GCASH">GCash</option>
                <option value="MAYA">Maya</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="ETSY">Etsy</option>
              </select>

              <button type="submit">Filter</button>
              <a href="/admin/orders">Reset</a>
            </form>

            {orders.length > 0 ? (
              <>
                <div className={styles.tableWrap}>
                  <table className={styles.ordersTable}>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Payment</th>
                        <th>Amount</th>
                        <th>Delivery</th>
                        <th>Date</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order: OrderRow) => (
                        <tr key={order.id}>
                          <td>
                            <div className={styles.orderNumber}>
                              <strong>{order.order_number}</strong>
                              <small>
                                {order.order_source || "WEBSITE"} ·{" "}
                                {order.id.slice(0, 8)}
                              </small>
                            </div>
                          </td>

                          <td>
                            <div className={styles.customer}>
                              <strong>{order.customer_name}</strong>
                              <small>{order.customer_email}</small>
                            </div>
                          </td>

                          <td>
                            <div className={styles.product}>
                              <strong>{order.product_name}</strong>
                              <small>
                                Base{" "}
                                {formatMoney(Number(order.base_price ?? 0))} · Fee{" "}
                                {formatMoney(
                                  Number(order.processing_fee ?? 0),
                                )}
                              </small>
                            </div>
                          </td>

                          <td>
                            <div className={styles.paymentCell}>
                              <span
                                className={`${styles.statusPill} ${
                                  order.payment_status === "COMPLETED"
                                    ? styles.completed
                                    : order.payment_status === "PENDING"
                                      ? styles.pending
                                      : styles.muted
                                }`}
                              >
                                {order.payment_status}
                              </span>
                              <small>{order.payment_provider || "—"}</small>
                            </div>
                          </td>

                          <td>
                            <strong className={styles.amount}>
                              {formatMoney(Number(order.total_amount ?? 0))}
                            </strong>
                          </td>

                          <td>
                            <span className={styles.deliveryPill}>
                              {order.delivery_status}
                            </span>
                          </td>

                          <td>
                            <div className={styles.dateCell}>
                              <strong>{formatDateTime(order.created_at)}</strong>
                              {order.paid_at ? (
                                <small>
                                  Paid {formatDateTime(order.paid_at)}
                                </small>
                              ) : (
                                <small>Not paid yet</small>
                              )}
                            </div>
                          </td>

                          <td>
                            <a
                              className={styles.detailsButton}
                              href={`/admin/orders/${order.id}`}
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 ? (
                  <nav
                    className={styles.pagination}
                    aria-label="Orders pagination"
                  >
                    <a
                      className={
                        currentPage === 1
                          ? styles.pageDisabled
                          : styles.pageArrow
                      }
                      href={buildPageUrl(Math.max(1, currentPage - 1))}
                      aria-disabled={currentPage === 1}
                    >
                      ←
                    </a>

                    <div className={styles.pageNumbers}>
                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1,
                      ).map((page) => (
                        <a
                          key={page}
                          href={buildPageUrl(page)}
                          className={
                            page === currentPage
                              ? styles.pageActive
                              : styles.pageNumber
                          }
                          aria-current={
                            page === currentPage ? "page" : undefined
                          }
                        >
                          {page}
                        </a>
                      ))}
                    </div>

                    <a
                      className={
                        currentPage === totalPages
                          ? styles.pageDisabled
                          : styles.pageArrow
                      }
                      href={buildPageUrl(
                        Math.min(totalPages, currentPage + 1),
                      )}
                      aria-disabled={currentPage === totalPages}
                    >
                      →
                    </a>
                  </nav>
                ) : null}
              </>
            ) : (
              <div className={styles.emptyState}>
                <div>▣</div>
                <strong>No matching orders</strong>
                <p>Try changing your search or filters.</p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
