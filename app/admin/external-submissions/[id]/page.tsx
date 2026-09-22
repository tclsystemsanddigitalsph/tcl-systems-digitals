import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import dashboardStyles from "../../dashboard.module.css";
import DeleteExternalSubmission from "./DeleteExternalSubmission";
import styles from "./external-submission-detail.module.css";
import {
  addExternalSubmissionToOrders,
  updateExternalSubmissionProgress,
  deleteExternalSubmission,
} from "../actions";

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

function statusTone(status: string | null) {
  if (status === "APPROVED" || status === "COMPLETED") {
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

function platformLabel(platform: string, platformName: string | null) {
  if (platform === "ETSY") return "Etsy";
  if (platform === "RAKETPH") return "RaketPH";
  return platformName || "Other Platform";
}

function currentFocus(requirementsStatus: string, projectStatus: string) {
  if (
    requirementsStatus === "SUBMITTED" ||
    requirementsStatus === "RESUBMITTED"
  ) {
    return {
      eyebrow: "ACTION NEEDED",
      title: "Verify order & review requirements",
      description:
        "Confirm the marketplace purchase, then review the buyer's submitted project brief.",
      tone: styles.focusImportant,
    };
  }

  if (requirementsStatus === "NEED_MORE_INFO") {
    return {
      eyebrow: "WAITING ON CLIENT",
      title: "Additional information requested",
      description:
        "More information is needed from the marketplace buyer before the project can continue.",
      tone: styles.focusWaiting,
    };
  }

  if (projectStatus === "READY_FOR_HANDOVER") {
    return {
      eyebrow: "NEXT STEP",
      title: "Project is ready for handover",
      description:
        "The external marketplace project is ready for its final customer handover.",
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
        "This marketplace project is actively moving through your workflow.",
      tone: styles.focusActive,
    };
  }

  if (projectStatus === "COMPLETED") {
    return {
      eyebrow: "COMPLETE",
      title: "Project completed",
      description: "No project work is currently required for this submission.",
      tone: styles.focusComplete,
    };
  }

  return {
    eyebrow: "PROJECT STATUS",
    title: titleCase(projectStatus),
    description:
      "Review the submission details and confirm the next step for this marketplace project.",
    tone: styles.focusNeutral,
  };
}

export default async function AdminExternalSubmissionDetailPage({
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
    .from("external_requirement_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("External submission detail error:", error);
  }

  if (!request) {
    notFound();
  }

  const requirementEntries =
    request.requirements &&
    typeof request.requirements === "object" &&
    !Array.isArray(request.requirements)
      ? Object.entries(request.requirements)
      : [];

  const hiddenKeys = new Set([
    "order_id",
    "buyer_name",
    "buyer_email",
    "project_assets_drive_link",
    "project_assets_confirmed",
    "scope_confirmation",
  ]);

  const projectAssetKeys = new Set([
    "project_assets_drive_link",
    "project_assets_confirmed",
  ]);

  const featureEntries = requirementEntries.filter(([key]) =>
    key.startsWith("feature_"),
  );

  const generalEntries = requirementEntries.filter(
    ([key]) =>
      !key.startsWith("feature_") &&
      !hiddenKeys.has(key) &&
      !projectAssetKeys.has(key),
  );

  const projectAssetsDriveLink =
    typeof request.requirements?.project_assets_drive_link === "string"
      ? request.requirements.project_assets_drive_link.trim()
      : "";

  const rawAssetsConfirmed =
    request.requirements?.project_assets_confirmed;

  const projectAssetsConfirmed =
    rawAssetsConfirmed === true ||
    rawAssetsConfirmed === "yes" ||
    rawAssetsConfirmed === "Yes";

  const scopeConfirmed =
    request.requirements?.scope_confirmation === true ||
    request.requirements?.scope_confirmation === "yes" ||
    request.requirements?.scope_confirmation === "Yes";

  const marketplace = platformLabel(request.platform, request.platform_name);
  const focus = currentFocus(
    request.requirements_status,
    request.project_status,
  );

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="external-submissions" email={user.email} />

        <section className="store-admin-main">
          <header
            className={`${dashboardStyles.topbar} ${styles.pageHeader}`}
          >
            <div className={styles.headerCopy}>
              <span className="store-admin-eyebrow">EXTERNAL SUBMISSION</span>
              <h1>{request.product_name}</h1>
              <p>
                {request.buyer_name || "Customer"} · {marketplace} ·{" "}
                {request.marketplace_order_id}
              </p>
            </div>

            <div
              className={`${dashboardStyles.topbarActions} ${styles.headerActions}`}
            >
              <a
                className={dashboardStyles.secondaryButton}
                href="/admin/external-submissions"
              >
                ← All Submissions
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
              <span>Marketplace</span>
              <strong>{marketplace}</strong>
            </div>

            <div>
              <span>Order ID</span>
              <strong>{request.marketplace_order_id}</strong>
            </div>

            <div>
              <span>Submitted</span>
              <strong>{formatDate(request.submitted_at)}</strong>
            </div>
          </section>

          <section className={styles.layout}>
            <div className={styles.content}>
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <span>BUYER & PURCHASE</span>
                    <h2>Marketplace information</h2>
                    <p>
                      Buyer, marketplace, order reference, and purchased product
                      submitted through the external requirements form.
                    </p>
                  </div>
                </div>

                <div className={styles.metaGrid}>
                  <div>
                    <span>Buyer</span>
                    <strong>{request.buyer_name || "—"}</strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>{request.buyer_email || "—"}</strong>
                  </div>

                  <div>
                    <span>Marketplace</span>
                    <strong>{marketplace}</strong>
                  </div>

                  <div>
                    <span>Order / Transaction ID</span>
                    <strong>{request.marketplace_order_id}</strong>
                  </div>

                  <div>
                    <span>Product</span>
                    <strong>{request.product_name}</strong>
                  </div>

                  <div>
                    <span>Product Slug</span>
                    <strong>{request.product_slug}</strong>
                  </div>
                </div>
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <span>CUSTOMER BRIEF</span>
                    <h2>Business & project details</h2>
                    <p>
                      Requirements submitted by the marketplace buyer for this
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
                    No general requirements were submitted.
                  </div>
                )}
              </section>

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <span>PROJECT FILES & ASSETS</span>
                    <h2>Customer Google Drive folder</h2>
                    <p>
                      Review any logos, photos, documents, product images,
                      references, policies, and other project assets supplied by
                      the buyer.
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
                      Buyer confirmed file access & naming:{" "}
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

              {featureEntries.length > 0 ? (
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div>
                      <span>FEATURE WORKFLOWS</span>
                      <h2>How each feature should work</h2>
                      <p>
                        Expand a feature to review the buyer&apos;s submitted
                        workflow details.
                      </p>
                    </div>

                    <div className={styles.sectionCount}>
                      {featureEntries.length}
                    </div>
                  </div>

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
                </section>
              ) : null}

              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <div>
                    <span>PURCHASE ACKNOWLEDGEMENT</span>
                    <h2>Buyer confirmation</h2>
                    <p>
                      Confirmation captured when the external requirements form
                      was submitted.
                    </p>
                  </div>
                </div>

                <div className={styles.answers}>
                  <div className={styles.answerRow}>
                    <span>Scope Confirmation</span>
                    <p>
                      {scopeConfirmed
                        ? "Yes — buyer acknowledged that the marketplace order will be verified and that requests outside the purchased package may require a separate quotation or additional fee."
                        : "No confirmation recorded."}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className={styles.sidebar}>
              {request.linked_order_id ? (
                <section className={styles.marketplaceVerified}>
                  <span className={styles.marketplaceVerifiedBadge}>
                    ✓ Verified & recorded
                  </span>
                  <h2>{marketplace} purchase</h2>
                  <p>
                    This marketplace purchase is linked to TCL Orders and is
                    included in your order and revenue records.
                  </p>
                  <a href={`/admin/orders/${request.linked_order_id}`}>
                    Open TCL Order →
                  </a>
                </section>
              ) : (
                <form
                  action={addExternalSubmissionToOrders}
                  className={styles.marketplaceCard}
                >
                  <div className={styles.marketplaceTop}>
                    <span className={styles.marketplaceEyebrow}>
                      ORDER VERIFICATION
                    </span>
                    <h2>{marketplace} purchase</h2>
                    <p>
                      Confirm the purchase against the marketplace order before
                      recording it in TCL Orders.
                    </p>
                  </div>

                  <div className={styles.marketplaceFacts}>
                    <div className={styles.marketplaceFact}>
                      <span>Order ID</span>
                      <strong>{request.marketplace_order_id}</strong>
                    </div>
                    <div className={styles.marketplaceFact}>
                      <span>Product</span>
                      <strong>{request.product_name}</strong>
                    </div>
                    <div className={styles.marketplaceFact}>
                      <span>Buyer</span>
                      <strong>{request.buyer_name}</strong>
                    </div>
                  </div>

                  <div className={styles.marketplaceRecord}>
                    <span className={styles.marketplaceRecordTitle}>
                      RECORD IN TCL
                    </span>

                    <input
                      type="hidden"
                      name="submission_id"
                      value={request.id}
                    />

                    <label className={styles.marketplaceAmountLabel}>
                      <span>Gross amount paid</span>
                      <div className={styles.marketplaceAmountWrap}>
                        <b className={styles.marketplaceCurrency}>₱</b>
                        <input
                          type="number"
                          name="gross_amount"
                          min="0.01"
                          step="0.01"
                          inputMode="decimal"
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <small>
                        Full amount paid by the customer before marketplace fees.
                      </small>
                    </label>

                    <button
                      type="submit"
                      className={styles.marketplaceAction}
                    >
                      Verify & Add to TCL Orders →
                    </button>

                    <p className={styles.marketplaceFootnote}>
                      Creates one paid TCL order and links it to this submission.
                      No duplicate Project Requirements record will be created.
                    </p>
                  </div>
                </form>
              )}

              <form
                action={updateExternalSubmissionProgress}
                className={styles.workflowCard}
              >
                <div className={styles.workflowHeader}>
                  <span>PROJECT PROGRESS</span>
                  <h2>Manage external project</h2>
                  <p>
                    Update the requirements review and project stage for this
                    marketplace order.
                  </p>
                </div>

                <input type="hidden" name="submission_id" value={request.id} />

                <label>
                  <span>Requirements status</span>
                  <select
                    name="requirements_status"
                    defaultValue={request.requirements_status}
                    required
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="NEED_MORE_INFO">Need More Info</option>
                    <option value="RESUBMITTED">Resubmitted</option>
                    <option value="APPROVED">Approved</option>
                  </select>
                </label>

                <label>
                  <span>Project progress</span>
                  <select
                    name="project_status"
                    defaultValue={request.project_status}
                    required
                  >
                    <option value="REVIEWING">Reviewing</option>
                    <option value="NEED_MORE_INFO">Need More Info</option>
                    <option value="READY_TO_BUILD">Ready to Build</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="QA_REVIEW">QA Review</option>
                    <option value="READY_FOR_HANDOVER">Ready for Handover</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </label>

                <label>
                  <span>Admin notes</span>
                  <textarea
                    name="admin_notes"
                    rows={3}
                    defaultValue={request.admin_notes ?? ""}
                    placeholder="Private notes for TCL..."
                  />
                  <small className={styles.privateHint}>
                    Internal only. The customer does not see this.
                  </small>
                </label>

                <label className={styles.customerRequestField}>
                  <span>Customer update note</span>
                  <textarea
                    name="customer_update_note"
                    rows={3}
                    defaultValue={request.customer_update_note ?? ""}
                    placeholder="Add a note about missing details or the latest project update..."
                  />
                  <small>
                    Use this to keep track of information requested from the
                    marketplace buyer.
                  </small>
                </label>

                <button type="submit">Save Progress</button>
              </form>

              {request.admin_notes ? (
                <section className={styles.linkCard}>
                  <span>PRIVATE ADMIN NOTES</span>
                  <strong>Internal notes</strong>
                  <p>{request.admin_notes}</p>
                </section>
              ) : null}

              {request.customer_update_note ? (
                <section className={styles.linkCard}>
                  <span>CUSTOMER UPDATE</span>
                  <strong>Information request</strong>
                  <p>{request.customer_update_note}</p>
                </section>
              ) : null}

              <section className={styles.activityCard}>
                <div className={styles.activityHeader}>
                  <span>SUBMISSION ACTIVITY</span>
                  <h2>Timeline</h2>
                  <p>Important milestones for this marketplace project.</p>
                </div>

                <div className={styles.timeline}>
                  <div className={styles.timelineItem}>
                    <i className={request.created_at ? styles.doneDot : ""} />
                    <div>
                      <span>Submission received</span>
                      <strong>{formatDate(request.created_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i className={request.submitted_at ? styles.doneDot : ""} />
                    <div>
                      <span>Requirements submitted</span>
                      <strong>{formatDate(request.submitted_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i className={request.verified_at ? styles.doneDot : ""} />
                    <div>
                      <span>Marketplace order verified</span>
                      <strong>{formatDate(request.verified_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i
                      className={
                        request.more_info_requested_at ? styles.doneDot : ""
                      }
                    />
                    <div>
                      <span>More information requested</span>
                      <strong>
                        {formatDate(request.more_info_requested_at)}
                      </strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i className={request.approved_at ? styles.doneDot : ""} />
                    <div>
                      <span>Requirements approved</span>
                      <strong>{formatDate(request.approved_at)}</strong>
                    </div>
                  </div>

                  <div className={styles.timelineItem}>
                    <i className={request.completed_at ? styles.doneDot : ""} />
                    <div>
                      <span>Project completed</span>
                      <strong>{formatDate(request.completed_at)}</strong>
                    </div>
                  </div>
                </div>
              </section>
              <DeleteExternalSubmission
                submissionId={request.id}
                hasLinkedOrder={Boolean(request.linked_order_id)}
                action={deleteExternalSubmission}
              />

            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}
