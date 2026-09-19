import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import ProjectWorkflowForm from "./ProjectWorkflowForm";
import dashboardStyles from "../../dashboard.module.css";
import styles from "./project-requirements-detail.module.css";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

function titleCase(value: string | null) {
  if (!value) return "—";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "—";
  }

  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}

function labelize(key: string) {
  return key
    .replaceAll("_", " ")
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

function statusTone(status: string | null) {
  if (
    status === "APPROVED" ||
    status === "COMPLETED" ||
    status === "DELIVERED"
  ) {
    return styles.statusSuccess;
  }

  if (
    status === "SUBMITTED" ||
    status === "RESUBMITTED" ||
    status === "REVIEWING" ||
    status === "READY_TO_BUILD"
  ) {
    return styles.statusReview;
  }

  if (
    status === "IN_PROGRESS" ||
    status === "QA_REVIEW" ||
    status === "READY_FOR_HANDOVER"
  ) {
    return styles.statusActive;
  }

  if (status === "NEED_MORE_INFO") {
    return styles.statusCustomer;
  }

  if (status === "CANCELLED") {
    return styles.statusCancelled;
  }

  return styles.statusNeutral;
}

function currentFocus(
  requirementsStatus: string,
  projectStatus: string,
  deliveryStatus: string,
) {
  if (
    requirementsStatus === "SUBMITTED" ||
    requirementsStatus === "RESUBMITTED"
  ) {
    return {
      eyebrow: "ACTION NEEDED",
      title: "Review customer requirements",
      description:
        "The customer has submitted their project brief and it is ready for your review.",
      tone: styles.focusImportant,
    };
  }

  if (requirementsStatus === "NEED_MORE_INFO") {
    return {
      eyebrow: "WAITING ON CUSTOMER",
      title: "Additional information requested",
      description:
        "The customer needs to update their requirements before the project can continue.",
      tone: styles.focusWaiting,
    };
  }

  if (
    requirementsStatus === "NOT_STARTED" ||
    requirementsStatus === "IN_PROGRESS"
  ) {
    return {
      eyebrow: "WAITING ON CUSTOMER",
      title: "Requirements are not complete yet",
      description:
        "The customer is still preparing their project brief. No build work is required yet.",
      tone: styles.focusWaiting,
    };
  }

  if (projectStatus === "READY_FOR_HANDOVER") {
    return {
      eyebrow: "NEXT STEP",
      title: "Project is ready for handover",
      description:
        "Complete the customer handover and update the delivery status when finished.",
      tone: styles.focusImportant,
    };
  }

  if (projectStatus === "QA_REVIEW") {
    return {
      eyebrow: "IN REVIEW",
      title: "Complete final quality review",
      description:
        "Check the project carefully before moving it to ready for handover.",
      tone: styles.focusActive,
    };
  }

  if (
    projectStatus === "IN_PROGRESS" ||
    projectStatus === "READY_TO_BUILD" ||
    projectStatus === "REVIEWING"
  ) {
    return {
      eyebrow: "ACTIVE PROJECT",
      title: titleCase(projectStatus),
      description:
        "This project is actively moving through your build workflow.",
      tone: styles.focusActive,
    };
  }

  if (deliveryStatus === "IN_PROGRESS") {
    return {
      eyebrow: "DELIVERY",
      title: "Handover is in progress",
      description:
        "Finish the customer delivery and mark it delivered once everything has been handed over.",
      tone: styles.focusActive,
    };
  }

  if (
    projectStatus === "COMPLETED" &&
    deliveryStatus === "DELIVERED"
  ) {
    return {
      eyebrow: "COMPLETE",
      title: "Project completed and delivered",
      description:
        "No action is currently required for this project.",
      tone: styles.focusComplete,
    };
  }

  return {
    eyebrow: "PROJECT STATUS",
    title: titleCase(projectStatus),
    description:
      "Review the project details and update the workflow when the next milestone is reached.",
    tone: styles.focusNeutral,
  };
}

export default async function AdminProjectRequirementDetailPage({
  params,
}: Props) {
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
    .from("project_requirements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Project requirement detail error:", error);
  }

  if (!request) {
    notFound();
  }

  const { data: linkedOrder, error: linkedOrderError } = await adminSupabase
    .from("orders")
    .select("delivery_status,delivered_at,payment_terms,balance_due,amount_paid,payment_status,total_amount")
    .eq("id", request.order_id)
    .maybeSingle();

  if (linkedOrderError) {
    console.error(
      "Project requirement linked order load error:",
      linkedOrderError,
    );
  }

  const requirementEntries =
    request.requirements &&
    typeof request.requirements === "object" &&
    !Array.isArray(request.requirements)
      ? Object.entries(request.requirements)
      : [];

  const projectAssetKeys = new Set([
    "project_assets_drive_link",
    "project_assets_confirmed",
  ]);

  const generalEntries = requirementEntries.filter(
    ([key]) => !key.startsWith("feature_") && !projectAssetKeys.has(key),
  );

  const projectAssetsDriveLink =
    typeof request.requirements?.project_assets_drive_link === "string"
      ? request.requirements.project_assets_drive_link.trim()
      : "";

  const projectAssetsConfirmed =
    request.requirements?.project_assets_confirmed === true;

  const featureEntries = requirementEntries.filter(([key]) =>
    key.startsWith("feature_"),
  );

  const shownTier = displayProjectTier(
    request.product_slug,
    request.product_tier,
  );

  const deliveryStatus = linkedOrder?.delivery_status || "NOT_STARTED";
  const paymentTerms =
    typeof linkedOrder?.payment_terms === "string"
      ? linkedOrder.payment_terms
      : null;
  const balanceDue = Number(linkedOrder?.balance_due || 0);

  const focus = currentFocus(
    request.requirements_status,
    request.project_status,
    deliveryStatus,
  );

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="requirements" email={user.email} />

        <section className="store-admin-main">
          <header
            className={`${dashboardStyles.topbar} ${styles.pageHeader}`}
          >
            <div className={styles.headerCopy}>
              <span className="store-admin-eyebrow">PROJECT REQUIREMENTS</span>
              <h1>{request.product_name}</h1>
              <p>
                {request.customer_name || "Customer"} · {request.order_number}
              </p>
            </div>

            <div
              className={`${dashboardStyles.topbarActions} ${styles.headerActions}`}
            >
              <a
                className={dashboardStyles.secondaryButton}
                href="/admin/project-requirements"
              >
                ← All Projects
              </a>

              <a
                className={dashboardStyles.secondaryButton}
                href={`/admin/orders/${request.order_id}`}
              >
                View Order
              </a>
            </div>
          </header>

          <section className={`${styles.focusCard} ${focus.tone}`}>
            <div>
              <span>{focus.eyebrow}</span>
              <h2>{focus.title}</h2>
              <p>{focus.description}</p>
            </div>

            <div className={styles.focusArrow}>→</div>
          </section>

          <section className={styles.statusStrip}>
            <div>
              <span>Requirements</span>
              <strong
                className={`${styles.statusPill} ${statusTone(
                  request.requirements_status,
                )}`}
              >
                {titleCase(request.requirements_status)}
              </strong>
            </div>

            <div>
              <span>Project</span>
              <strong
                className={`${styles.statusPill} ${statusTone(
                  request.project_status,
                )}`}
              >
                {titleCase(request.project_status)}
              </strong>
            </div>

            <div>
              <span>Delivery</span>
              <strong
                className={`${styles.statusPill} ${statusTone(deliveryStatus)}`}
              >
                {titleCase(deliveryStatus)}
              </strong>
            </div>

            <div>
              <span>Tier</span>
              <strong>{shownTier}</strong>
            </div>

            <div>
              <span>Submitted</span>
              <strong>
                {request.submitted_at
                  ? formatDate(request.submitted_at)
                  : "Not yet"}
              </strong>
            </div>
          </section>

          <section className={styles.layout}>
            <div className={styles.content}>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <span>CUSTOMER & ORDER</span>
                    <h2>Project information</h2>
                    <p>
                      Customer, purchase, and package details for this project.
                    </p>
                  </div>
                </div>

                <div className={styles.metaGrid}>
                  <div>
                    <span>Customer</span>
                    <strong>{request.customer_name || "—"}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{request.customer_email}</strong>
                  </div>

                  <div>
                    <span>Order number</span>
                    <strong>{request.order_number}</strong>
                  </div>

                  <div>
                    <span>Product</span>
                    <strong>{request.product_name}</strong>
                  </div>

                  <div>
                    <span>Category</span>
                    <strong>{request.product_category || "—"}</strong>
                  </div>

                  <div>
                    <span>Tier</span>
                    <strong>{shownTier}</strong>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <span>CUSTOMER BRIEF</span>
                    <h2>Business & project details</h2>
                    <p>
                      The main information submitted by the customer for this
                      project.
                    </p>
                  </div>

                  <div className={styles.sectionCount}>
                    {generalEntries.length}
                  </div>
                </div>

                {generalEntries.length > 0 ? (
                  <div className={styles.answers}>
                    {generalEntries.map(([key, value]) => (
                      <div className={styles.answerRow} key={key}>
                        <span>{labelize(key)}</span>
                        <p>{renderValue(value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.empty}>
                    No general requirements submitted yet.
                  </div>
                )}
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <span>PROJECT FILES & ASSETS</span>
                    <h2>Customer Google Drive folder</h2>
                    <p>
                      Review the logos, photos, documents, references, menus,
                      product images, policies, and other project assets supplied
                      by the customer.
                    </p>
                  </div>
                </div>

                <div className={styles.assetPanel}>
                  <div className={styles.assetIcon}>↗</div>

                  <div className={styles.assetCopy}>
                    <span>GOOGLE DRIVE FOLDER</span>
                    <strong>
                      {projectAssetsDriveLink
                        ? "Project assets available"
                        : "No folder provided"}
                    </strong>
                    <p>
                      Customer confirmed file access & naming:{" "}
                      <b>{projectAssetsConfirmed ? "Yes" : "No"}</b>
                    </p>
                  </div>

                  {projectAssetsDriveLink ? (
                    <a
                      className={styles.assetButton}
                      href={projectAssetsDriveLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Folder →
                    </a>
                  ) : null}
                </div>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <span>FEATURE WORKFLOWS</span>
                    <h2>How each feature should work</h2>
                    <p>
                      Expand a feature to review the customer&apos;s workflow
                      details.
                    </p>
                  </div>

                  <div className={styles.sectionCount}>
                    {featureEntries.length}
                  </div>
                </div>

                {featureEntries.length > 0 ? (
                  <div className={styles.featureList}>
                    {featureEntries.map(([key, value]) => (
                      <details className={styles.featureItem} key={key}>
                        <summary>
                          <span>
                            {labelize(key.replace(/^feature_/, ""))}
                          </span>
                          <b>+</b>
                        </summary>

                        <div>
                          <p>{renderValue(value)}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <div className={styles.empty}>
                    No feature workflow details submitted yet.
                  </div>
                )}

                {request.customer_notes ? (
                  <div className={styles.notes}>
                    <span>ADDITIONAL CUSTOMER NOTES</span>
                    <p>{request.customer_notes}</p>
                  </div>
                ) : null}
              </section>
            </div>

            <aside className={styles.sidebar}>
              <ProjectWorkflowForm
                id={request.id}
                requirementsStatus={request.requirements_status}
                projectStatus={request.project_status}
                deliveryStatus={deliveryStatus}
                adminNotes={request.admin_notes || ""}
                customerUpdateNote={request.customer_update_note || ""}
                paymentTerms={paymentTerms}
                balanceDue={balanceDue}
              />

              <section className={styles.linkCard}>
                <div className={styles.linkIcon}>↗</div>
                <span>CUSTOMER ACCESS</span>
                <strong>Secure requirements form</strong>
                <p>
                  Open the customer&apos;s secure form to view the same page they
                  use for updates and resubmissions.
                </p>

                <a
                  href={`/project-requirements/${request.secure_token}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Customer Form →
                </a>
              </section>

              <section className={styles.activityCard}>
                <div className={styles.activityHeader}>
                  <span>PROJECT ACTIVITY</span>
                  <h2>Timeline</h2>
                  <p>Important milestones for this project.</p>
                </div>

                <div className={styles.timeline}>
                  <div className={styles.timelineItem}>
                    <i className={request.created_at ? styles.doneDot : ""} />
                    <div>
                      <span>Requirements created</span>
                      <strong>{formatDate(request.created_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i
                      className={request.first_opened_at ? styles.doneDot : ""}
                    />
                    <div>
                      <span>Customer first opened form</span>
                      <strong>{formatDate(request.first_opened_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i
                      className={request.submitted_at ? styles.doneDot : ""}
                    />
                    <div>
                      <span>Requirements submitted</span>
                      <strong>{formatDate(request.submitted_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i
                      className={request.approved_at ? styles.doneDot : ""}
                    />
                    <div>
                      <span>Requirements approved</span>
                      <strong>{formatDate(request.approved_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i
                      className={request.completed_at ? styles.doneDot : ""}
                    />
                    <div>
                      <span>Project completed</span>
                      <strong>{formatDate(request.completed_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i
                      className={linkedOrder?.delivered_at ? styles.doneDot : ""}
                    />
                    <div>
                      <span>Delivered to customer</span>
                      <strong>{formatDate(linkedOrder?.delivered_at || null)}</strong>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}
