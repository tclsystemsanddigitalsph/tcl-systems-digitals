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

function titleCase(value: string) {
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

  return productTier || "Custom";
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
    .select("delivery_status,delivered_at")
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

  const featureEntries = requirementEntries.filter(
    ([key]) => key.startsWith("feature_"),
  );

  const shownTier = displayProjectTier(
    request.product_slug,
    request.product_tier,
  );

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="requirements" email={user.email} />

        <section className="store-admin-main">
          <header className={dashboardStyles.topbar}>
            <div>
              <span className="store-admin-eyebrow">PROJECT REQUIREMENTS</span>
              <h1>{request.product_name}</h1>
              <p>
                {request.customer_name || "Customer"} · {request.order_number}
              </p>
            </div>

            <div className={dashboardStyles.topbarActions}>
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

          <section className={styles.statusStrip}>
            <div>
              <span>Requirements</span>
              <strong className={styles.statusPill}>
                {titleCase(request.requirements_status)}
              </strong>
            </div>

            <div>
              <span>Project</span>
              <strong className={styles.statusPill}>
                {titleCase(request.project_status)}
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
                    <span>GENERAL REQUIREMENTS</span>
                    <h2>Business & project details</h2>
                    <p>
                      Main information submitted by the customer for this
                      project.
                    </p>
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
                      Open the shared folder to review logos, photos, documents,
                      references, menus, product images, policies, and other
                      project assets supplied by the customer.
                    </p>
                  </div>
                </div>

                <div className={styles.answers}>
                  <div className={styles.answerRow}>
                    <span>Google Drive folder</span>
                    <p>
                      {projectAssetsDriveLink ? (
                        <a
                          href={projectAssetsDriveLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Google Drive Folder →
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </p>
                  </div>

                  <div className={styles.answerRow}>
                    <span>Customer confirmed file access & naming</span>
                    <p>{projectAssetsConfirmed ? "Yes" : "No"}</p>
                  </div>
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
                deliveryStatus={linkedOrder?.delivery_status || "NOT_STARTED"}
                adminNotes={request.admin_notes || ""}
                customerUpdateNote={request.customer_update_note || ""}
              />

              <section className={styles.linkCard}>
                <span>SECURE PROJECT LINK</span>
                <strong>Customer requirements form</strong>
                <p>
                  Reopen the customer&apos;s secure form when they need to
                  update their answers.
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
                  <span>ACTIVITY</span>
                  <h2>Project timeline</h2>
                  <p>Important milestones for this project.</p>
                </div>

                <div className={styles.timeline}>
                  <div className={styles.timelineItem}>
                    <i />
                    <div>
                      <span>Requirements created</span>
                      <strong>{formatDate(request.created_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i />
                    <div>
                      <span>Customer first opened form</span>
                      <strong>{formatDate(request.first_opened_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i />
                    <div>
                      <span>Requirements submitted</span>
                      <strong>{formatDate(request.submitted_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i />
                    <div>
                      <span>Requirements approved</span>
                      <strong>{formatDate(request.approved_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i />
                    <div>
                      <span>Project completed</span>
                      <strong>{formatDate(request.completed_at)}</strong>
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
