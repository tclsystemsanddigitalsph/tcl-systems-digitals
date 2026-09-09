import { redirect } from "next/navigation";
import Link from "next/link";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import styles from "../dashboard.module.css";

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
  if (value === null) return "—";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function statusClass(status: string) {
  if (status === "ACCEPTED" || status === "QUOTED") return styles.completed;
  if (status === "NEW" || status === "REVIEWING") return styles.pending;
  return styles.muted;
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
  const reviewingCount = rows.filter((item) => item.status === "REVIEWING").length;
  const quotedCount = rows.filter((item) => item.status === "QUOTED").length;
  const acceptedCount = rows.filter((item) => item.status === "ACCEPTED").length;

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="quotations" email={user.email} />

        <section className="store-admin-main">
          <header className={styles.topbar}>
            <div>
              <span className="store-admin-eyebrow">QUOTATIONS</span>
              <h1>Quotation Requests</h1>
              <p>
                Review project requirements, prepare pricing, and manage quote
                follow-ups.
              </p>
            </div>

            <div className={styles.topbarActions}>
              <a className={styles.secondaryButton} href="/admin">
                Dashboard
              </a>
              <a className={styles.primaryButton} href="/">
                View Store
              </a>
            </div>
          </header>

          <section className={styles.stats}>
            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>NEW</span>
                <i>✦</i>
              </div>
              <strong>{newCount}</strong>
              <small>New requests waiting for review</small>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>REVIEWING</span>
                <i>⌕</i>
              </div>
              <strong>{reviewingCount}</strong>
              <small>Requests currently being assessed</small>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>QUOTED</span>
                <i>₱</i>
              </div>
              <strong>{quotedCount}</strong>
              <small>Quotes already sent or prepared</small>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>ACCEPTED</span>
                <i>♡</i>
              </div>
              <strong>{acceptedCount}</strong>
              <small>Approved quotations ready to proceed</small>
            </article>
          </section>

          <section className={styles.ordersPanel}>
            <div className={styles.panelHeader}>
              <div>
                <span>REQUESTS</span>
                <h2>All quotation requests</h2>
                <p>
                  Open a request to view full business details and manage the quote.
                </p>
              </div>
            </div>

            {rows.length > 0 ? (
              <div className={styles.transactions}>
                {rows.map((request) => (
                  <Link
                    key={request.id}
                    href={`/admin/quotation-requests/${request.id}`}
                    className={styles.transactionCard}
                  >
                    <div className={styles.transactionTop}>
                      <div className={styles.customerBlock}>
                        <div className={styles.avatar}>
                          {request.business_name?.charAt(0).toUpperCase() ||
                            request.full_name?.charAt(0).toUpperCase() ||
                            "Q"}
                        </div>

                        <div className={styles.customerText}>
                          <strong>{request.business_name}</strong>
                          <span>
                            {request.full_name} · {request.email}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`${styles.status} ${statusClass(
                          request.status,
                        )}`}
                      >
                        {statusLabel(request.status)}
                      </span>
                    </div>

                    <div className={styles.transactionMiddle}>
                      <div className={styles.productBlock}>
                        <span>SERVICE</span>
                        <strong>{request.product_name}</strong>
                      </div>

                      <div className={styles.amountBlock}>
                        <span>QUOTED AMOUNT</span>
                        <strong>
                          {formatMoney(
                            request.quoted_amount === null
                              ? null
                              : Number(request.quoted_amount),
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.transactionBottom}>
                      <div>
                        <span className={styles.metaLabel}>BUDGET</span>
                        <strong>{request.budget}</strong>
                      </div>

                      <div>
                        <span className={styles.metaLabel}>TIMELINE</span>
                        <strong>{request.timeline}</strong>
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
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <div>✦</div>
                <strong>No quotation requests yet</strong>
                <p>
                  New quotation requests submitted through the store will appear
                  here.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
