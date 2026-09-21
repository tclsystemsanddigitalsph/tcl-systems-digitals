import { redirect } from "next/navigation";
import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import styles from "./quotation-requests.module.css";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function formatMoney(value: number | null) {
  if (value === null) return "Not quoted yet";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function statusLabel(status: string) {
  switch (status) {
    case "NEW":
      return "New";
    case "REVIEWING":
      return "Reviewing";
    case "QUOTED":
      return "Quoted";
    case "ACCEPTED":
      return "Accepted";
    case "DECLINED":
      return "Declined";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "NEW":
      return styles.statusNew;
    case "REVIEWING":
      return styles.statusReviewing;
    case "QUOTED":
      return styles.statusQuoted;
    case "ACCEPTED":
      return styles.statusAccepted;
    case "DECLINED":
      return styles.statusDeclined;
    case "CLOSED":
      return styles.statusClosed;
    default:
      return styles.statusClosed;
  }
}

export default async function AdminQuotationRequestsPage() {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminSupabase = createAdminSupabaseClient();

  const { data: requests, error } = await adminSupabase
    .from("quotation_requests")
    .select(
      "id,product_name,business_name,full_name,email,budget,timeline,status,quoted_amount,created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Quotation requests error:", error);
  }

  const rows = requests ?? [];

  const newCount = rows.filter((item) => item.status === "NEW").length;
  const reviewingCount = rows.filter(
    (item) => item.status === "REVIEWING",
  ).length;
  const quotedCount = rows.filter((item) => item.status === "QUOTED").length;
  const acceptedCount = rows.filter(
    (item) => item.status === "ACCEPTED",
  ).length;

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="quotations" email={user.email} />

        <section className="store-admin-main">
          <div className={styles.page}>
            <header className={styles.topbar}>
              <div className={styles.heading}>
                <span className={styles.eyebrow}>QUOTATIONS</span>
                <h1>Quotation Requests</h1>
                <p>Review requests, prepare pricing, and track client decisions.</p>
              </div>

              <Link
                className={styles.primaryButton}
                href="/admin/quotation-requests/new"
              >
                + Add quotation
              </Link>
            </header>

            <section className={styles.summary}>
              <div>
                <span>ALL REQUESTS</span>
                <strong>{rows.length}</strong>
              </div>
              <div>
                <span>NEW</span>
                <strong>{newCount}</strong>
              </div>
              <div>
                <span>REVIEWING</span>
                <strong>{reviewingCount}</strong>
              </div>
              <div>
                <span>QUOTED</span>
                <strong>{quotedCount}</strong>
              </div>
              <div>
                <span>ACCEPTED</span>
                <strong>{acceptedCount}</strong>
              </div>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelEyebrow}>REQUESTS</span>
                  <h2>All quotations</h2>
                </div>
                <span className={styles.requestCount}>
                  {rows.length} {rows.length === 1 ? "record" : "records"}
                </span>
              </div>

              {rows.length > 0 ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Status</th>
                        <th>Budget</th>
                        <th>Quoted</th>
                        <th>Submitted</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((request) => (
                        <tr key={request.id}>
                          <td>
                            <div className={styles.client}>
                              <strong>
                                {request.business_name ||
                                  request.full_name ||
                                  "Unnamed request"}
                              </strong>
                              <span>
                                {request.full_name}
                                {request.full_name && request.email ? " · " : ""}
                                {request.email}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className={styles.service}>
                              <strong>
                                {request.product_name || "Custom Business Website"}
                              </strong>
                              <span>{request.timeline || "Timeline not specified"}</span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`${styles.statusBadge} ${statusClass(
                                request.status,
                              )}`}
                            >
                              {statusLabel(request.status)}
                            </span>
                          </td>

                          <td className={styles.secondaryValue}>
                            {request.budget || "—"}
                          </td>

                          <td className={styles.amount}>
                            {formatMoney(
                              request.quoted_amount === null
                                ? null
                                : Number(request.quoted_amount),
                            )}
                          </td>

                          <td className={styles.date}>
                            {formatDate(request.created_at)}
                          </td>

                          <td className={styles.actionCell}>
                            <Link
                              href={`/admin/quotation-requests/${request.id}`}
                              className={styles.viewButton}
                            >
                              Open →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.empty}>
                  <strong>No quotation requests yet</strong>
                  <p>New quotation requests will appear here.</p>
                  <Link
                    className={styles.primaryButton}
                    href="/admin/quotation-requests/new"
                  >
                    + Add quotation
                  </Link>
                </div>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
