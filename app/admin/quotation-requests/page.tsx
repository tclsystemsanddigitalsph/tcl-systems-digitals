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
                <p>
                  Review project requirements, prepare pricing, and manage quote
                  follow-ups.
                </p>
              </div>

              <div className={styles.topbarActions}>
                <Link className={styles.secondaryButton} href="/admin">
                  Dashboard
                </Link>
                <Link className={styles.primaryButton} href="/">
                  View Store
                </Link>
              </div>
            </header>

            <section className={styles.statsGrid}>
              <article className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span>NEW</span>
                  <div className={styles.statIcon}>✦</div>
                </div>
                <strong>{newCount}</strong>
                <p>Waiting for review</p>
              </article>

              <article className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span>REVIEWING</span>
                  <div className={styles.statIcon}>⌕</div>
                </div>
                <strong>{reviewingCount}</strong>
                <p>Currently being assessed</p>
              </article>

              <article className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span>QUOTED</span>
                  <div className={styles.statIcon}>₱</div>
                </div>
                <strong>{quotedCount}</strong>
                <p>Quote already prepared</p>
              </article>

              <article className={styles.statCard}>
                <div className={styles.statHeader}>
                  <span>ACCEPTED</span>
                  <div className={styles.statIcon}>♡</div>
                </div>
                <strong>{acceptedCount}</strong>
                <p>Ready to proceed</p>
              </article>
            </section>

            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <span className={styles.panelEyebrow}>REQUESTS</span>
                  <h2>All quotation requests</h2>
                  <p>
                    Open a request to view full business details and manage the
                    quote.
                  </p>
                </div>

                <div className={styles.requestCount}>
                  {rows.length} {rows.length === 1 ? "request" : "requests"}
                </div>
              </div>

              {rows.length > 0 ? (
                <div className={styles.requestList}>
                  {rows.map((request) => {
                    const initial =
                      request.business_name?.charAt(0).toUpperCase() ||
                      request.full_name?.charAt(0).toUpperCase() ||
                      "Q";

                    return (
                      <article className={styles.requestCard} key={request.id}>
                        <div className={styles.cardTop}>
                          <div className={styles.customer}>
                            <div className={styles.avatar}>{initial}</div>

                            <div className={styles.customerDetails}>
                              <div className={styles.customerTitleRow}>
                                <h3>{request.business_name || "No business name"}</h3>
                                <span
                                  className={`${styles.statusBadge} ${statusClass(
                                    request.status,
                                  )}`}
                                >
                                  {statusLabel(request.status)}
                                </span>
                              </div>

                              <p>
                                {request.full_name}
                                <span>•</span>
                                {request.email}
                              </p>
                            </div>
                          </div>

                          <Link
                            href={`/admin/quotation-requests/${request.id}`}
                            className={styles.viewButton}
                          >
                            View Request →
                          </Link>
                        </div>

                        <div className={styles.cardBody}>
                          <div className={styles.serviceBlock}>
                            <span className={styles.metaLabel}>SERVICE</span>
                            <strong>
                              {request.product_name || "Custom Business Website"}
                            </strong>
                          </div>

                          <div className={styles.amountBlock}>
                            <span className={styles.metaLabel}>QUOTED AMOUNT</span>
                            <strong>
                              {formatMoney(
                                request.quoted_amount === null
                                  ? null
                                  : Number(request.quoted_amount),
                              )}
                            </strong>
                          </div>
                        </div>

                        <div className={styles.metaGrid}>
                          <div>
                            <span className={styles.metaLabel}>BUDGET</span>
                            <strong>{request.budget || "—"}</strong>
                          </div>

                          <div>
                            <span className={styles.metaLabel}>TIMELINE</span>
                            <strong>{request.timeline || "—"}</strong>
                          </div>

                          <div>
                            <span className={styles.metaLabel}>STATUS</span>
                            <strong>{statusLabel(request.status)}</strong>
                          </div>

                          <div>
                            <span className={styles.metaLabel}>SUBMITTED</span>
                            <strong>{formatDate(request.created_at)}</strong>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>✦</div>
                  <strong>No quotation requests yet</strong>
                  <p>
                    New quotation requests submitted through the store will
                    appear here.
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
