import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { updateDeliveryRequest } from "./actions";
import AdminNav from "@/app/admin/AdminNav";
import styles from "./deliveries.module.css";

type DeliveryPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function deliveryStatusClass(status: string) {
  if (status === "COMPLETED") return styles.completed;
  if (status === "IN_PROGRESS") return styles.inProgress;
  if (status === "CANCELLED") return styles.cancelled;
  return styles.pending;
}

export default async function DeliveriesPage({
  searchParams,
}: DeliveryPageProps) {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const selectedStatus = (params.status ?? "ALL").toUpperCase();

  const adminSupabase = createAdminSupabaseClient();

  const { data: requestRows, error: requestError } =
    await adminSupabase
      .from("delivery_requests")
      .select(
        "id,order_id,delivery_type,github_username,status,customer_message,admin_notes,requested_at,delivered_at,created_at,updated_at",
      )
      .order("created_at", { ascending: false });

  if (requestError) {
    console.error("Admin deliveries load error:", requestError);
  }

  const requests = requestRows ?? [];

  const orderIds = Array.from(
    new Set(requests.map((item) => item.order_id).filter(Boolean)),
  );

  const { data: orderRows, error: orderError } = orderIds.length
    ? await adminSupabase
        .from("orders")
        .select(
          "id,order_number,customer_name,customer_email,product_name,payment_status,delivery_status,total_amount,currency",
        )
        .in("id", orderIds)
    : { data: [], error: null };

  if (orderError) {
    console.error("Admin delivery orders load error:", orderError);
  }

  const orderMap = new Map(
    (orderRows ?? []).map((order) => [order.id, order]),
  );

  const filteredRequests =
    selectedStatus === "ALL"
      ? requests
      : requests.filter(
          (request) => request.status === selectedStatus,
        );

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING",
  ).length;

  const inProgressCount = requests.filter(
    (request) => request.status === "IN_PROGRESS",
  ).length;

  const completedCount = requests.filter(
    (request) => request.status === "COMPLETED",
  ).length;

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="deliveries" email={user.email} />

        <section className="store-admin-main">
          <div className={styles.page}>
            <header className={styles.topbar}>
              <div>
                <span className="store-admin-eyebrow">FULFILLMENT</span>
                <h1>Manual Deliveries</h1>
                <p>Manage manual handovers, transfers, and fulfillment requests.</p>
              </div>

              <Link
                href="/admin/project-requirements"
                className={styles.secondaryButton}
              >
                Project Requirements →
              </Link>
            </header>

            <section className={styles.stats}>
              <div className={styles.statFocus}>
                <span>PENDING</span>
                <strong>{pendingCount}</strong>
              </div>
              <div>
                <span>IN PROGRESS</span>
                <strong>{inProgressCount}</strong>
              </div>
              <div>
                <span>COMPLETED</span>
                <strong>{completedCount}</strong>
              </div>
              <div>
                <span>TOTAL REQUESTS</span>
                <strong>{requests.length}</strong>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span>DELIVERY QUEUE</span>
                  <h2>Manual fulfillment requests</h2>
                </div>

                <form className={styles.filterForm}>
                  <select
                    name="status"
                    defaultValue={selectedStatus}
                    aria-label="Filter by delivery status"
                  >
                    <option value="ALL">All statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <button type="submit">Filter</button>
                </form>
              </div>

              <div className={styles.contextBar}>
                <strong>Manual fulfillment only.</strong>
                <span>
                  Customized website projects are managed in Project Requirements.
                  Automatic downloads are handled through Digital Access.
                </span>
              </div>

              {filteredRequests.length > 0 ? (
                <div className={styles.requestList}>
                  {filteredRequests.map((request) => {
                    const order = orderMap.get(request.order_id);

                    return (
                      <article key={request.id} className={styles.requestCard}>
                        <div className={styles.requestHeader}>
                          <div className={styles.requestIdentity}>
                            <div className={styles.requestMeta}>
                              <span
                                className={`${styles.statusPill} ${deliveryStatusClass(
                                  request.status,
                                )}`}
                              >
                                {request.status.replaceAll("_", " ")}
                              </span>
                              <span>{request.delivery_type}</span>
                            </div>

                            <h3>
                              {order?.product_name || "Manual delivery request"}
                            </h3>
                            <p>
                              {order?.customer_name || "Unknown customer"}
                              {order?.customer_email
                                ? ` · ${order.customer_email}`
                                : ""}
                            </p>
                          </div>

                          <div className={styles.orderLinkBlock}>
                            {order ? (
                              <>
                                <span>{order.order_number}</span>
                                <a href={`/admin/orders/${order.id}`}>
                                  View order →
                                </a>
                              </>
                            ) : (
                              <span>Order unavailable</span>
                            )}
                          </div>
                        </div>

                        <div className={styles.detailsGrid}>
                          <div>
                            <span>REQUESTED</span>
                            <strong>
                              {formatDateTime(
                                request.requested_at || request.created_at,
                              )}
                            </strong>
                          </div>
                          <div>
                            <span>GITHUB</span>
                            <strong>{request.github_username || "—"}</strong>
                          </div>
                          <div>
                            <span>PAYMENT</span>
                            <strong>{order?.payment_status || "—"}</strong>
                          </div>
                          <div>
                            <span>ORDER DELIVERY</span>
                            <strong>{order?.delivery_status || "—"}</strong>
                          </div>
                        </div>

                        {request.customer_message ? (
                          <div className={styles.customerMessage}>
                            <span>CUSTOMER MESSAGE</span>
                            <p>{request.customer_message}</p>
                          </div>
                        ) : null}

                        <form
                          action={updateDeliveryRequest}
                          className={styles.manageForm}
                        >
                          <input
                            type="hidden"
                            name="request_id"
                            value={request.id}
                          />
                          <input
                            type="hidden"
                            name="order_id"
                            value={request.order_id}
                          />

                          <div className={styles.formRow}>
                            <label>
                              <span>STATUS</span>
                              <select
                                name="status"
                                defaultValue={request.status}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </label>

                            <label className={styles.notesField}>
                              <span>ADMIN NOTES</span>
                              <textarea
                                name="admin_notes"
                                defaultValue={request.admin_notes ?? ""}
                                placeholder="Internal fulfillment notes"
                                rows={2}
                              />
                            </label>

                            <button type="submit">Save</button>
                          </div>

                          <p className={styles.internalNote}>
                            Admin notes are internal and are not shown to the customer.
                          </p>
                        </form>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <strong>No delivery requests found</strong>
                  <p>
                    Manual fulfillment requests will appear here when a purchased
                    product requires them.
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
