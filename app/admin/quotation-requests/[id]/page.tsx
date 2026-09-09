import { redirect, notFound } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import styles from "../../dashboard.module.css";
import detailStyles from "./quotation-detail.module.css";
import { updateQuotationRequest } from "../actions";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function formatMoney(value: number | string | null) {
  if (value === null || value === "") return "—";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
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

function Field({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const display =
    value === null || value === undefined || String(value).trim() === ""
      ? "—"
      : String(value);

  return (
    <div className={detailStyles.field}>
      <span>{label}</span>
      <strong>{display}</strong>
    </div>
  );
}

export default async function AdminQuotationRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const adminSupabase = createAdminSupabaseClient();

  const { data: request, error } = await adminSupabase
    .from("quotation_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Quotation request detail error:", error);
  }

  if (!request) {
    notFound();
  }

  const features = Array.isArray(request.selected_features)
    ? request.selected_features
    : [];

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="quotations" email={user.email} />

        <section className="store-admin-main">
          <header className={styles.topbar}>
            <div>
              <span className="store-admin-eyebrow">QUOTATION DETAILS</span>
              <h1>{request.business_name}</h1>
              <p>
                {request.product_name} · Submitted {formatDate(request.created_at)}
              </p>
            </div>

            <div className={styles.topbarActions}>
              <a
                className={styles.secondaryButton}
                href="/admin/quotation-requests"
              >
                ← All Quotations
              </a>
            </div>
          </header>

          <section className={detailStyles.summaryGrid}>
            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>STATUS</span>
                <i>✦</i>
              </div>
              <span
                className={`${styles.status} ${statusClass(request.status)}`}
              >
                {statusLabel(request.status)}
              </span>
              <small>Current quotation stage</small>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>BUDGET</span>
                <i>₱</i>
              </div>
              <strong className={detailStyles.compactStat}>
                {request.budget}
              </strong>
              <small>Customer's estimated budget</small>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>QUOTED</span>
                <i>◇</i>
              </div>
              <strong className={detailStyles.compactStat}>
                {formatMoney(request.quoted_amount)}
              </strong>
              <small>{request.quoted_at ? formatDate(request.quoted_at) : "Not quoted yet"}</small>
            </article>
          </section>

          <section className={detailStyles.layout}>
            <div className={detailStyles.mainColumn}>
              <section className={detailStyles.card}>
                <div className={detailStyles.cardHeader}>
                  <span>CUSTOMER</span>
                  <h2>Contact & business details</h2>
                  <p>Basic information submitted with the request.</p>
                </div>

                <div className={detailStyles.fieldGrid}>
                  <Field label="Full name" value={request.full_name} />
                  <Field label="Business name" value={request.business_name} />
                  <Field label="Email" value={request.email} />
                  <Field label="Mobile / Telegram" value={request.contact_number} />
                  <Field
                    label="Preferred contact"
                    value={request.preferred_contact}
                  />
                  <Field label="Business type" value={request.business_type} />
                  <Field
                    label="Business location"
                    value={request.business_location}
                  />
                  <Field
                    label="How long operating"
                    value={request.business_age}
                  />
                  <Field label="Staff / team size" value={request.staff_count} />
                  <Field
                    label="Number of locations"
                    value={request.location_count}
                  />
                  <Field
                    label="Website / social page"
                    value={request.current_link}
                  />
                </div>

                <Field
                  label="Products / services offered"
                  value={request.offerings}
                />
              </section>

              <section className={detailStyles.card}>
                <div className={detailStyles.cardHeader}>
                  <span>WORKFLOW</span>
                  <h2>Current setup & problems</h2>
                  <p>What the customer currently uses and wants to improve.</p>
                </div>

                <Field
                  label="Current process / system"
                  value={request.current_process}
                />
                <Field label="Main problems" value={request.main_problems} />
                <Field label="Main project goal" value={request.main_goal} />
              </section>

              <section className={detailStyles.card}>
                <div className={detailStyles.cardHeader}>
                  <span>REQUIREMENTS</span>
                  <h2>Requested features</h2>
                  <p>Features and functionality the customer selected.</p>
                </div>

                {features.length > 0 ? (
                  <div className={detailStyles.featureGrid}>
                    {features.map((feature: string) => (
                      <span key={feature}>✓ {feature}</span>
                    ))}
                  </div>
                ) : (
                  <div className={detailStyles.emptyText}>
                    No specific features selected.
                  </div>
                )}

                <div className={detailStyles.fieldGrid}>
                  <Field
                    label="Expected monthly volume"
                    value={request.expected_volume}
                  />
                  <Field
                    label="Payment methods"
                    value={request.payment_methods}
                  />
                  <Field
                    label="Delivery / fulfillment"
                    value={request.delivery_needs}
                  />
                  <Field
                    label="Admin / staff access"
                    value={request.admin_access}
                  />
                </div>

                <Field label="Integrations" value={request.integrations} />
              </section>

              <section className={detailStyles.card}>
                <div className={detailStyles.cardHeader}>
                  <span>BRANDING</span>
                  <h2>Branding & content readiness</h2>
                  <p>Assets the customer already has or still needs.</p>
                </div>

                <div className={detailStyles.fieldGrid}>
                  <Field label="Logo ready" value={request.logo_ready} />
                  <Field
                    label="Branding ready"
                    value={request.branding_ready}
                  />
                  <Field label="Content ready" value={request.content_ready} />
                  <Field label="Domain status" value={request.domain_status} />
                  <Field label="Timeline" value={request.timeline} />
                </div>

                <Field label="Additional notes" value={request.notes} />
              </section>
            </div>

            <aside className={detailStyles.sideColumn}>
              <section className={detailStyles.manageCard}>
                <div className={detailStyles.cardHeader}>
                  <span>ADMIN</span>
                  <h2>Manage quotation</h2>
                  <p>Update the stage, pricing, and internal notes.</p>
                </div>

                <form action={updateQuotationRequest}>
                  <input type="hidden" name="id" value={request.id} />

                  <label>
                    Status
                    <select name="status" defaultValue={request.status}>
                      <option value="NEW">New</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="QUOTED">Quoted</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="DECLINED">Declined</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </label>

                  <label>
                    Quoted amount
                    <input
                      type="number"
                      name="quoted_amount"
                      min="0"
                      step="0.01"
                      defaultValue={
                        request.quoted_amount !== null
                          ? String(request.quoted_amount)
                          : ""
                      }
                      placeholder="0.00"
                    />
                  </label>

                  <label>
                    Admin notes
                    <textarea
                      name="admin_notes"
                      rows={8}
                      defaultValue={request.admin_notes ?? ""}
                      placeholder="Internal notes, scope, pricing notes, follow-up details..."
                    />
                  </label>

                  <button type="submit">Save Changes</button>
                </form>
              </section>

              <section className={detailStyles.metaCard}>
                <span>REQUEST INFO</span>

                <div>
                  <small>Request ID</small>
                  <strong>{request.id}</strong>
                </div>

                <div>
                  <small>Submitted</small>
                  <strong>{formatDate(request.created_at)}</strong>
                </div>

                <div>
                  <small>Last updated</small>
                  <strong>{formatDate(request.updated_at)}</strong>
                </div>
              </section>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}
