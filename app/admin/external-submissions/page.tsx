import { redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import styles from "./external-submissions-list.module.css";

export const dynamic = "force-dynamic";

type ExternalSubmission = {
  id: string;
  platform: string;
  platform_name: string | null;
  marketplace_order_id: string;
  buyer_name: string;
  buyer_email: string;
  product_slug: string;
  product_name: string;
  requirements_status: string;
  project_status: string;
  linked_order_id: string | null;
  verified_at: string | null;
  submitted_at: string;
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

function platformLabel(item: ExternalSubmission) {
  if (item.platform === "ETSY") return "Etsy";
  if (item.platform === "RAKETPH") return "RaketPH";
  return item.platform_name || "Other Platform";
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

function priorityInfo(item: ExternalSubmission) {
  if (
    item.requirements_status === "SUBMITTED" ||
    item.requirements_status === "RESUBMITTED"
  ) {
    return {
      rank: 0,
      label: "Verify & review",
      note: "Confirm the marketplace order and review the submitted brief.",
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
      note: "Marketplace project is moving through your workflow.",
      className: styles.priorityActive,
    };
  }

  if (
    item.requirements_status === "NEED_MORE_INFO" ||
    item.project_status === "NEED_MORE_INFO"
  ) {
    return {
      rank: 4,
      label: "Waiting on client",
      note: "More information is needed from the marketplace buyer.",
      className: styles.priorityCustomer,
    };
  }

  if (item.project_status === "COMPLETED") {
    return {
      rank: 6,
      label: "Completed",
      note: "Project workflow is complete.",
      className: styles.priorityDone,
    };
  }

  return {
    rank: 5,
    label: "Open",
    note: "Submission is available for review.",
    className: styles.priorityWaiting,
  };
}

export default async function AdminExternalSubmissionsPage() {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminSupabase = createAdminSupabaseClient();

  const { data, error } = await adminSupabase
    .from("external_requirement_submissions")
    .select(
      "id,platform,platform_name,marketplace_order_id,buyer_name,buyer_email,product_slug,product_name,requirements_status,project_status,linked_order_id,verified_at,submitted_at,created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("External submissions error:", error);
  }

  const submissions = (data ?? []) as ExternalSubmission[];

  const needsReview = submissions.filter(
    (item) =>
      item.requirements_status === "SUBMITTED" ||
      item.requirements_status === "RESUBMITTED",
  ).length;

  const waitingOnClient = submissions.filter(
    (item) =>
      item.requirements_status === "NEED_MORE_INFO" ||
      item.project_status === "NEED_MORE_INFO",
  ).length;

  const activeProjects = submissions.filter((item) =>
    ["REVIEWING", "READY_TO_BUILD", "IN_PROGRESS", "QA_REVIEW"].includes(
      item.project_status,
    ),
  ).length;

  const readyForHandover = submissions.filter(
    (item) => item.project_status === "READY_FOR_HANDOVER",
  ).length;

  const completedProjects = submissions.filter(
    (item) => item.project_status === "COMPLETED",
  ).length;

  const recordedOrders = submissions.filter(
    (item) => Boolean(item.linked_order_id),
  ).length;

  const sortedSubmissions = [...submissions].sort((a, b) => {
    const priorityDifference = priorityInfo(a).rank - priorityInfo(b).rank;

    if (priorityDifference !== 0) return priorityDifference;

    return (
      new Date(b.submitted_at || b.created_at).getTime() -
      new Date(a.submitted_at || a.created_at).getTime()
    );
  });

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="external-submissions" email={user.email} />

        <section className="store-admin-main">
          <div className={styles.page}>
            <header className={styles.pageHeader}>
              <div>
                <span className="store-admin-eyebrow">MARKETPLACE WORKFLOW</span>
                <h1>External Submissions</h1>
                <p>
                  Review requirements submitted by Etsy, RaketPH, and other
                  marketplace customers.
                </p>
              </div>

              <a className={styles.secondaryButton} href="/submit-requirements">
                Open requirements form
              </a>
            </header>

            <section className={styles.summaryBar}>
              <div>
                <span>TOTAL SUBMISSIONS</span>
                <strong>{submissions.length}</strong>
              </div>
              <div className={styles.summaryFocus}>
                <span>NEEDS REVIEW</span>
                <strong>{needsReview}</strong>
              </div>
              <div>
                <span>WAITING CLIENT</span>
                <strong>{waitingOnClient}</strong>
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
                <span>RECORDED</span>
                <strong>{recordedOrders}</strong>
              </div>
            </section>

            <section className={styles.projectsSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <span>EXTERNAL QUEUE</span>
                  <h2>Marketplace projects</h2>
                </div>
                <p>
                  New submissions needing review are shown first. {completedProjects} completed.
                </p>
              </div>

              {sortedSubmissions.length > 0 ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Marketplace Order</th>
                        <th>Product</th>
                        <th>Requirements</th>
                        <th>Progress</th>
                        <th>Priority</th>
                        <th>Submitted</th>
                        <th aria-label="Actions" />
                      </tr>
                    </thead>

                    <tbody>
                      {sortedSubmissions.map((item) => {
                        const priority = priorityInfo(item);

                        return (
                          <tr key={item.id}>
                            <td>
                              <div className={styles.primaryCell}>
                                <strong>{item.buyer_name || "Customer"}</strong>
                                <span>{item.buyer_email || "No email"}</span>
                              </div>
                            </td>

                            <td>
                              <div className={styles.primaryCell}>
                                <strong>{platformLabel(item)}</strong>
                                <span>#{item.marketplace_order_id}</span>
                                <strong
                                  className={
                                    item.linked_order_id
                                      ? `${styles.statusPill} ${styles.statusSuccess}`
                                      : `${styles.statusPill} ${styles.statusNeutral}`
                                  }
                                >
                                  {item.linked_order_id
                                    ? "Recorded in TCL"
                                    : "Not yet recorded"}
                                </strong>
                              </div>
                            </td>

                            <td>
                              <div className={styles.primaryCell}>
                                <strong>{item.product_name || "Custom Project"}</strong>
                                <span>{item.product_slug}</span>
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
                                href={`/admin/external-submissions/${item.id}`}
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
                  <strong>No external submissions yet</strong>
                  <p>
                    Requirements submitted from Etsy, RaketPH, or another
                    marketplace will appear here.
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
