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
          <div className={styles.page}>
            <header className={styles.pageHeader}>
              <div>
                <span className="store-admin-eyebrow">PROJECT WORKFLOW</span>
                <h1>Project Requirements</h1>
                <p>Review client requirements and track customized projects through delivery.</p>
              </div>

              <a className={styles.secondaryButton} href="/admin/orders">
                View orders
              </a>
            </header>

            <section className={styles.summaryBar}>
              <div>
                <span>TOTAL PROJECTS</span>
                <strong>{requirements.length}</strong>
              </div>
              <div className={styles.summaryFocus}>
                <span>NEEDS REVIEW</span>
                <strong>{needsReview}</strong>
              </div>
              <div>
                <span>WAITING CLIENT</span>
                <strong>{waitingOnCustomer}</strong>
              </div>
              <div>
                <span>ACTIVE</span>
                <strong>{activeProjects}</strong>
              </div>
              <div>
                <span>READY</span>
                <strong>{readyForHandover}</strong>
              </div>
              <div>
                <span>COMPLETED</span>
                <strong>{completedProjects}</strong>
              </div>
            </section>

            <section className={styles.projectsSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <span>PROJECT QUEUE</span>
                  <h2>Client projects</h2>
                </div>
                <p>Items needing attention are prioritized automatically.</p>
              </div>

              {sortedRequirements.length > 0 ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Project</th>
                        <th>Requirements</th>
                        <th>Progress</th>
                        <th>Priority</th>
                        <th>Updated</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>

                    <tbody>
                      {sortedRequirements.map((item) => {
                        const priority = priorityInfo(item);
                        const shownTier = displayProjectTier(
                          item.product_slug,
                          item.product_tier,
                        );

                        return (
                          <tr key={item.id}>
                            <td>
                              <div className={styles.primaryCell}>
                                <strong>{item.customer_name || "Customer"}</strong>
                                <span>{item.customer_email || "No email"}</span>
                              </div>
                            </td>

                            <td>
                              <div className={styles.primaryCell}>
                                <strong>{item.product_name || "Custom Project"}</strong>
                                <span>
                                  {item.order_number || "No order"} · {shownTier}
                                </span>
                              </div>
                            </td>

                            <td>
                              <strong
                                className={requirementStatusClass(
                                  item.requirements_status,
                                )}
                              >
                                {titleCase(item.requirements_status)}
                              </strong>
                            </td>

                            <td>
                              <strong
                                className={projectStatusClass(item.project_status)}
                              >
                                {titleCase(item.project_status)}
                              </strong>
                            </td>

                            <td>
                              <div className={styles.priority}>
                                <span className={priority.className} />
                                <div>
                                  <strong>{priority.label}</strong>
                                  <small>{priority.note}</small>
                                </div>
                              </div>
                            </td>

                            <td className={styles.dateCell}>
                              {formatDate(item.submitted_at || item.created_at)}
                            </td>

                            <td className={styles.actionCell}>
                              <a
                                href={`/admin/project-requirements/${item.id}`}
                                className={styles.openProject}
                              >
                                Open →
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <strong>No project requirements yet</strong>
                  <p>
                    Paid customized services will appear here once their project
                    requirements record is created.
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
