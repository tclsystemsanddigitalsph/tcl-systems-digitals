import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import styles from "../dashboard.module.css";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function requirementStatusClass(status: string) {
  if (status === "APPROVED") {
    return `${styles.status} ${styles.completed}`;
  }

  if (
    status === "SUBMITTED" ||
    status === "RESUBMITTED" ||
    status === "NEED_MORE_INFO"
  ) {
    return `${styles.status} ${styles.pending}`;
  }

  return `${styles.status} ${styles.muted}`;
}

function projectStatusClass(status: string) {
  if (status === "COMPLETED") {
    return `${styles.status} ${styles.completed}`;
  }

  if (
    status === "REVIEWING" ||
    status === "NEED_MORE_INFO" ||
    status === "READY_TO_BUILD" ||
    status === "IN_PROGRESS" ||
    status === "QA_REVIEW" ||
    status === "READY_FOR_HANDOVER"
  ) {
    return `${styles.status} ${styles.pending}`;
  }

  return `${styles.status} ${styles.muted}`;
}

export default async function AdminProjectRequirementsPage() {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminSupabase = createAdminSupabaseClient();

  const { data, error } = await adminSupabase
    .from("project_requirements")
    .select(
      "id,order_number,customer_name,customer_email,product_name,product_category,product_tier,requirements_status,project_status,submitted_at,created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Project requirements error:", error);
  }

  const requirements = data ?? [];

  const waitingOnCustomer = requirements.filter(
    (item) =>
      item.requirements_status === "NOT_STARTED" ||
      item.requirements_status === "IN_PROGRESS" ||
      item.requirements_status === "NEED_MORE_INFO",
  ).length;

  const submitted = requirements.filter(
    (item) =>
      item.requirements_status === "SUBMITTED" ||
      item.requirements_status === "RESUBMITTED",
  ).length;

  const activeProjects = requirements.filter((item) =>
    [
      "REVIEWING",
      "READY_TO_BUILD",
      "IN_PROGRESS",
      "QA_REVIEW",
      "READY_FOR_HANDOVER",
    ].includes(item.project_status),
  ).length;

  const completedProjects = requirements.filter(
    (item) => item.project_status === "COMPLETED",
  ).length;

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="requirements" email={user.email} />

        <section className="store-admin-main">
          <header className={styles.topbar}>
            <div>
              <span className="store-admin-eyebrow">
                PROJECT WORKFLOW
              </span>

              <h1>Project Requirements</h1>

              <p>
                Review customer briefs for paid customized projects and track
                each project from requirements to handover.
              </p>
            </div>

            <div className={styles.topbarActions}>
              <a
                className={styles.secondaryButton}
                href="/admin/orders"
              >
                View Orders
              </a>

              <a
                className={styles.secondaryButton}
                href="/admin"
              >
                Dashboard
              </a>
            </div>
          </header>

          <section className={styles.stats}>
            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>WAITING</span>
                <i>◷</i>
              </div>

              <strong>{waitingOnCustomer}</strong>

              <small>
                Customers still completing requirements
              </small>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>SUBMITTED</span>
                <i>✓</i>
              </div>

              <strong>{submitted}</strong>

              <small>
                Project briefs ready for review
              </small>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>ACTIVE</span>
                <i>◇</i>
              </div>

              <strong>{activeProjects}</strong>

              <small>
                Projects currently in your workflow
              </small>
            </article>

            <article className={styles.statCard}>
              <div className={styles.statTop}>
                <span>COMPLETED</span>
                <i>☆</i>
              </div>

              <strong>{completedProjects}</strong>

              <small>
                Finished client projects
              </small>
            </article>
          </section>

          <section className={styles.ordersPanel}>
            <div className={styles.panelHeader}>
              <div>
                <span>CLIENT PROJECTS</span>
                <h2>Requirements submissions</h2>
                <p>
                  Open a project to review the customer&apos;s full brief,
                  internal notes, and current workflow status.
                </p>
              </div>
            </div>

            {requirements.length > 0 ? (
              <div className={styles.transactions}>
                {requirements.map((item) => (
                  <a
                    key={item.id}
                    href={`/admin/project-requirements/${item.id}`}
                    className={styles.transactionCard}
                  >
                    <div className={styles.transactionTop}>
                      <div className={styles.customerBlock}>
                        <div className={styles.avatar}>
                          {item.customer_name?.charAt(0).toUpperCase() || "C"}
                        </div>

                        <div className={styles.customerText}>
                          <strong>{item.customer_name || "Customer"}</strong>
                          <span>{item.customer_email}</span>
                        </div>
                      </div>

                      <span
                        className={requirementStatusClass(
                          item.requirements_status,
                        )}
                      >
                        {titleCase(item.requirements_status)}
                      </span>
                    </div>

                    <div className={styles.transactionMiddle}>
                      <div className={styles.productBlock}>
                        <span>PROJECT</span>
                        <strong>{item.product_name}</strong>
                      </div>

                      <div className={styles.amountBlock}>
                        <span>PROJECT STATUS</span>
                        <strong
                          className={projectStatusClass(
                            item.project_status,
                          )}
                        >
                          {titleCase(item.project_status)}
                        </strong>
                      </div>
                    </div>

                    <div className={styles.transactionBottom}>
                      <div>
                        <span className={styles.metaLabel}>ORDER</span>
                        <strong>{item.order_number}</strong>
                      </div>

                      <div>
                        <span className={styles.metaLabel}>TIER</span>
                        <strong>{item.product_tier || "Custom"}</strong>
                      </div>

                      <div>
                        <span className={styles.metaLabel}>CATEGORY</span>
                        <strong>{item.product_category || "—"}</strong>
                      </div>

                      <div>
                        <span className={styles.metaLabel}>
                          {item.submitted_at ? "SUBMITTED" : "CREATED"}
                        </span>
                        <strong>
                          {formatDate(
                            item.submitted_at || item.created_at,
                          )}
                        </strong>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <div>◇</div>
                <strong>No project requirements yet</strong>
                <p>
                  Fixed-price customized purchases will appear here once their
                  project requirements record is created.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
