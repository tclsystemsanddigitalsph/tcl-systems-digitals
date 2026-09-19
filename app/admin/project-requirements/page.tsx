import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import dashboardStyles from "../dashboard.module.css";
import styles from "./project-requirements-list.module.css";

export const dynamic = "force-dynamic";

type ProjectRequirement = {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  product_slug: string | null;
  product_name: string | null;
  product_category: string | null;
  product_tier: string | null;
  requirements_status: string;
  project_status: string;
  submitted_at: string | null;
  created_at: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function titleCase(value: string | null) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayProjectTier(
  productSlug: string | null,
  productTier: string | null,
) {
  if (productSlug === "simple-business-website") {
    return "Starter Website";
  }

  if (productSlug === "online-shop-with-admin") {
    return "Online Shop + Admin";
  }

  return productTier || "Custom";
}

function requirementStatusClass(status: string) {
  if (status === "APPROVED") {
    return `${styles.statusPill} ${styles.statusSuccess}`;
  }

  if (status === "SUBMITTED" || status === "RESUBMITTED") {
    return `${styles.statusPill} ${styles.statusReview}`;
  }

  if (status === "NEED_MORE_INFO") {
    return `${styles.statusPill} ${styles.statusCustomer}`;
  }

  return `${styles.statusPill} ${styles.statusNeutral}`;
}

function projectStatusClass(status: string) {
  if (status === "COMPLETED") {
    return `${styles.statusPill} ${styles.statusSuccess}`;
  }

  if (status === "READY_FOR_HANDOVER") {
    return `${styles.statusPill} ${styles.statusHandover}`;
  }

  if (status === "IN_PROGRESS" || status === "QA_REVIEW") {
    return `${styles.statusPill} ${styles.statusActive}`;
  }

  if (status === "REVIEWING" || status === "READY_TO_BUILD") {
    return `${styles.statusPill} ${styles.statusReview}`;
  }

  if (status === "NEED_MORE_INFO") {
    return `${styles.statusPill} ${styles.statusCustomer}`;
  }

  return `${styles.statusPill} ${styles.statusNeutral}`;
}

function priorityInfo(item: ProjectRequirement) {
  if (
    item.requirements_status === "SUBMITTED" ||
    item.requirements_status === "RESUBMITTED"
  ) {
    return {
      rank: 0,
      label: "Review brief",
      note: "Customer requirements are ready for your review.",
      className: styles.priorityHigh,
    };
  }

  if (item.project_status === "READY_FOR_HANDOVER") {
    return {
      rank: 1,
      label: "Handover",
      note: "Project is ready for customer delivery.",
      className: styles.priorityHandover,
    };
  }

  if (item.project_status === "QA_REVIEW") {
    return {
      rank: 2,
      label: "QA review",
      note: "Project is waiting for final quality review.",
      className: styles.priorityActive,
    };
  }

  if (
    item.project_status === "IN_PROGRESS" ||
    item.project_status === "READY_TO_BUILD" ||
    item.project_status === "REVIEWING"
  ) {
    return {
      rank: 3,
      label: "Active",
      note: "Project is currently moving through your workflow.",
      className: styles.priorityActive,
    };
  }

  if (
    item.requirements_status === "NEED_MORE_INFO" ||
    item.project_status === "NEED_MORE_INFO"
  ) {
    return {
      rank: 4,
      label: "Waiting on customer",
      note: "More information has been requested from the customer.",
      className: styles.priorityCustomer,
    };
  }

  if (
    item.requirements_status === "NOT_STARTED" ||
    item.requirements_status === "IN_PROGRESS"
  ) {
    return {
      rank: 5,
      label: "Waiting on customer",
      note: "Customer is still completing their requirements.",
      className: styles.priorityWaiting,
    };
  }

  if (item.project_status === "COMPLETED") {
    return {
      rank: 7,
      label: "Completed",
      note: "Project workflow is complete.",
      className: styles.priorityDone,
    };
  }

  return {
    rank: 6,
    label: "Open",
    note: "Project is available for review.",
    className: styles.priorityWaiting,
  };
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
      "id,order_number,customer_name,customer_email,product_slug,product_name,product_category,product_tier,requirements_status,project_status,submitted_at,created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Project requirements error:", error);
  }

  const requirements = (data ?? []) as ProjectRequirement[];

  const waitingOnCustomer = requirements.filter(
    (item) =>
      item.requirements_status === "NOT_STARTED" ||
      item.requirements_status === "IN_PROGRESS" ||
      item.requirements_status === "NEED_MORE_INFO",
  ).length;

  const needsReview = requirements.filter(
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
    ].includes(item.project_status),
  ).length;

  const readyForHandover = requirements.filter(
    (item) => item.project_status === "READY_FOR_HANDOVER",
  ).length;

  const completedProjects = requirements.filter(
    (item) => item.project_status === "COMPLETED",
  ).length;

  const sortedRequirements = [...requirements].sort((a, b) => {
    const priorityDifference = priorityInfo(a).rank - priorityInfo(b).rank;

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    const aDate = new Date(a.submitted_at || a.created_at).getTime();
    const bDate = new Date(b.submitted_at || b.created_at).getTime();

    return bDate - aDate;
  });

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="requirements" email={user.email} />

        <section className="store-admin-main">
          <header className={`${dashboardStyles.topbar} ${styles.pageHeader}`}>
            <div>
              <span className="store-admin-eyebrow">PROJECT WORKFLOW</span>
              <h1>Project Requirements</h1>
              <p>
                Review customer briefs and manage every customized project from
                requirements to final handover.
              </p>
            </div>

            <div className={`${dashboardStyles.topbarActions} ${styles.headerActions}`}>
              <a
                className={dashboardStyles.secondaryButton}
                href="/admin/orders"
              >
                View Orders
              </a>

              <a className={dashboardStyles.secondaryButton} href="/admin">
                Dashboard
              </a>
            </div>
          </header>

          <section className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <div className={styles.summaryHeading}>
                <span>WAITING ON CUSTOMER</span>
                <i>◷</i>
              </div>
              <strong>{waitingOnCustomer}</strong>
              <p>Requirements not finished or more information requested.</p>
            </article>

            <article className={`${styles.summaryCard} ${styles.summaryFocus}`}>
              <div className={styles.summaryHeading}>
                <span>NEEDS REVIEW</span>
                <i>!</i>
              </div>
              <strong>{needsReview}</strong>
              <p>Submitted or resubmitted briefs ready for your review.</p>
            </article>

            <article className={styles.summaryCard}>
              <div className={styles.summaryHeading}>
                <span>ACTIVE PROJECTS</span>
                <i>◇</i>
              </div>
              <strong>{activeProjects}</strong>
              <p>Projects currently being reviewed, built, or checked.</p>
            </article>

            <article className={styles.summaryCard}>
              <div className={styles.summaryHeading}>
                <span>READY TO HANDOVER</span>
                <i>↗</i>
              </div>
              <strong>{readyForHandover}</strong>
              <p>Projects ready for final delivery to the customer.</p>
            </article>

            <article className={styles.summaryCard}>
              <div className={styles.summaryHeading}>
                <span>COMPLETED</span>
                <i>✓</i>
              </div>
              <strong>{completedProjects}</strong>
              <p>Finished customized projects in your records.</p>
            </article>
          </section>

          <section className={styles.projectsSection}>
            <div className={styles.sectionHeader}>
              <div>
                <span>CLIENT PROJECTS</span>
                <h2>Project Queue</h2>
                <p>
                  Projects that need your attention appear first automatically.
                </p>
              </div>

              <div className={styles.queueCount}>
                <strong>{requirements.length}</strong>
                <span>Total projects</span>
              </div>
            </div>

            {sortedRequirements.length > 0 ? (
              <div className={styles.projectList}>
                {sortedRequirements.map((item) => {
                  const priority = priorityInfo(item);
                  const shownTier = displayProjectTier(
                    item.product_slug,
                    item.product_tier,
                  );

                  return (
                    <a
                      key={item.id}
                      href={`/admin/project-requirements/${item.id}`}
                      className={styles.projectCard}
                    >
                      <div className={styles.cardAccent} />

                      <div className={styles.projectMain}>
                        <div className={styles.projectTop}>
                          <div className={styles.customerIdentity}>
                            <div className={styles.avatar}>
                              {item.customer_name
                                ?.charAt(0)
                                .toUpperCase() || "C"}
                            </div>

                            <div className={styles.customerCopy}>
                              <strong>
                                {item.customer_name || "Customer"}
                              </strong>
                              <span>{item.customer_email || "No email"}</span>
                            </div>
                          </div>

                          <div
                            className={`${styles.priorityBadge} ${priority.className}`}
                          >
                            <span />
                            {priority.label}
                          </div>
                        </div>

                        <div className={styles.projectTitleRow}>
                          <div>
                            <span>PROJECT</span>
                            <h3>{item.product_name || "Custom Project"}</h3>
                            <p>{priority.note}</p>
                          </div>

                          <div className={styles.openProject}>
                            Open project <b>→</b>
                          </div>
                        </div>

                        <div className={styles.statusRow}>
                          <div>
                            <span className={styles.statusLabel}>
                              Requirements
                            </span>
                            <strong
                              className={requirementStatusClass(
                                item.requirements_status,
                              )}
                            >
                              {titleCase(item.requirements_status)}
                            </strong>
                          </div>

                          <div>
                            <span className={styles.statusLabel}>
                              Project
                            </span>
                            <strong
                              className={projectStatusClass(
                                item.project_status,
                              )}
                            >
                              {titleCase(item.project_status)}
                            </strong>
                          </div>
                        </div>

                        <div className={styles.metaGrid}>
                          <div>
                            <span>ORDER</span>
                            <strong>{item.order_number || "—"}</strong>
                          </div>

                          <div>
                            <span>TIER</span>
                            <strong>{shownTier}</strong>
                          </div>

                          <div>
                            <span>CATEGORY</span>
                            <strong>{item.product_category || "—"}</strong>
                          </div>

                          <div>
                            <span>
                              {item.submitted_at ? "SUBMITTED" : "CREATED"}
                            </span>
                            <strong>
                              {formatDate(
                                item.submitted_at || item.created_at,
                              )}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div>◇</div>
                <strong>No project requirements yet</strong>
                <p>
                  Paid customized services will appear here once their project
                  requirements record is created.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
