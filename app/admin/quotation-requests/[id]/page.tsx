import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import CopyPaymentLinkButton from "./CopyPaymentLinkButton";
import QuotationItemsEditor from "./QuotationItemsEditor";
import detailStyles from "./quotation-detail.module.css";
import {
  addManualQuotationNote,
  deleteQuotationRequest,
  updateQuotationRequest,
} from "../actions";

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

function formatMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
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
      return detailStyles.statusNew;
    case "REVIEWING":
      return detailStyles.statusReviewing;
    case "QUOTED":
      return detailStyles.statusQuoted;
    case "ACCEPTED":
      return detailStyles.statusAccepted;
    case "DECLINED":
      return detailStyles.statusDeclined;
    case "CLOSED":
      return detailStyles.statusClosed;
    default:
      return detailStyles.statusClosed;
  }
}

function paymentTermsLabel(value: string | null) {
  if (value === "DEPOSIT_50") return "50% Deposit + Remaining Balance";
  if (value === "FULL") return "Full Payment";
  return "Not set";
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

function DetailSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <details className={detailStyles.detailsCard}>
      <summary>
        <div>
          <span>{eyebrow}</span>
          <strong>{title}</strong>
          {description ? <small>{description}</small> : null}
        </div>
        <span className={detailStyles.detailsChevron}>⌄</span>
      </summary>
      <div className={detailStyles.detailsBody}>{children}</div>
    </details>
  );
}

export default async function AdminQuotationRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; note_added?: string }>;
}) {
  const authSupabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { id } = await params;
  const query = await searchParams;
  const adminSupabase = createAdminSupabaseClient();

  const { data: request, error } = await adminSupabase
    .from("quotation_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) console.error("Quotation request detail error:", error);
  if (!request) notFound();

  const features = Array.isArray(request.selected_features)
    ? request.selected_features
    : [];

  const { data: quotationItemsData, error: quotationItemsError } =
    await adminSupabase
      .from("quotation_items")
      .select("id,item_name,item_description,amount,display_order")
      .eq("quotation_request_id", request.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

  if (quotationItemsError) {
    console.error("Quotation items load error:", quotationItemsError);
  }

  const quotationItems = (quotationItemsData ?? []).map((item) => ({
    id: String(item.id),
    item_name: String(item.item_name ?? ""),
    item_description: item.item_description
      ? String(item.item_description)
      : null,
    amount: Number(item.amount ?? 0),
  }));

  const [{ data: activityLogs }, { data: noteLogs }] = await Promise.all([
    adminSupabase
      .from("quotation_activity_logs")
      .select("id,action_type,summary,details,created_at")
      .eq("quotation_request_id", request.id)
      .order("created_at", { ascending: false })
      .limit(100),
    adminSupabase
      .from("quotation_note_logs")
      .select("id,note_type,title,note,details,created_at")
      .eq("quotation_request_id", request.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  let order: {
    id: string;
    order_number: string;
    payment_status: string;
    total_amount: number | string | null;
    receipt_token: string | null;
    payment_terms: string | null;
    amount_paid: number | string | null;
    balance_due: number | string | null;
  } | null = null;

  let project: {
    id: string;
    secure_token: string;
    requirements_status: string;
    project_status: string;
  } | null = null;

  if (request.order_id) {
    const { data: orderData, error: orderError } = await adminSupabase
      .from("orders")
      .select(
        "id,order_number,payment_status,total_amount,receipt_token,payment_terms,amount_paid,balance_due",
      )
      .eq("id", request.order_id)
      .maybeSingle();

    if (orderError) {
      console.error("Quotation linked order load error:", orderError);
    } else {
      order = orderData;
    }

    const { data: projectData, error: projectError } = await adminSupabase
      .from("project_requirements")
      .select("id,secure_token,requirements_status,project_status")
      .eq("order_id", request.order_id)
      .maybeSingle();

    if (projectError) {
      console.error("Quotation linked project load error:", projectError);
    } else {
      project = projectData;
    }
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  const quotationPath = `/quotation/${request.secure_token}`;
  const quotationUrl = siteUrl ? `${siteUrl}${quotationPath}` : quotationPath;
  const checkoutPath = order?.receipt_token
    ? `/checkout/custom/${order.receipt_token}`
    : null;
  const checkoutUrl =
    checkoutPath && siteUrl ? `${siteUrl}${checkoutPath}` : checkoutPath;

  const quotedAmount = Number(request.quoted_amount ?? 0);
  const paidAmount = Number(order?.amount_paid ?? 0);
  const balanceAmount = Number(
    order?.balance_due ?? (quotedAmount > 0 ? quotedAmount : 0),
  );

  const displayName =
    request.business_name ||
    request.full_name ||
    "Quotation";

  const clientLinkAvailable =
    request.status === "QUOTED" || request.status === "ACCEPTED";

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="quotations" email={user.email} />

        <section className="store-admin-main">
          <div className={detailStyles.page}>
            <header className={detailStyles.topbar}>
              <div className={detailStyles.heading}>
                <span className={detailStyles.eyebrow}>QUOTATION</span>
                <h1>{displayName}</h1>
                <p>
                  {request.product_name || "Custom Project"} · Last updated{" "}
                  {formatDate(request.updated_at)}
                </p>
              </div>

              <Link
                className={detailStyles.backButton}
                href="/admin/quotation-requests"
              >
                ← Back to Quotations
              </Link>
            </header>

            {query.updated === "1" ? (
              <div
                role="status"
                style={{
                  marginBottom: 18,
                  padding: "13px 16px",
                  border: "1px solid #efc8d5",
                  borderRadius: 14,
                  background: "#fff7fa",
                  color: "#6f3348",
                  fontWeight: 700,
                }}
              >
                ✓ Quotation updated successfully.
              </div>
            ) : null}

            {query.note_added === "1" ? (
              <div
                role="status"
                style={{
                  marginBottom: 18,
                  padding: "13px 16px",
                  border: "1px solid #efc8d5",
                  borderRadius: 14,
                  background: "#fff7fa",
                  color: "#6f3348",
                  fontWeight: 700,
                }}
              >
                ✓ Note added successfully.
              </div>
            ) : null}

            <section className={detailStyles.overviewCard}>
              <div className={detailStyles.overviewIntro}>
                <div>
                  <span>QUOTATION OVERVIEW</span>
                  <h2>Current quotation status</h2>
                  <p>
                    The key information you need before editing or sending this
                    quotation to the client.
                  </p>
                </div>

                <span
                  className={`${detailStyles.statusBadge} ${statusClass(
                    request.status,
                  )}`}
                >
                  {statusLabel(request.status)}
                </span>
              </div>

              <div className={detailStyles.overviewGrid}>
                <div>
                  <span>CLIENT</span>
                  <strong>{request.full_name || "—"}</strong>
                  <small>{request.email || "No email added yet"}</small>
                </div>

                <div>
                  <span>AGREED / QUOTED TOTAL</span>
                  <strong>{formatMoney(request.quoted_amount)}</strong>
                  <small>
                    {order
                      ? `Client-selected: ${paymentTermsLabel(order.payment_terms)}`
                      : "Client selects payment option at acceptance"}
                  </small>
                </div>

                <div>
                  <span>PAID</span>
                  <strong>{order ? formatMoney(paidAmount) : "—"}</strong>
                  <small>{order ? order.payment_status : "No order yet"}</small>
                </div>

                <div>
                  <span>REMAINING BALANCE</span>
                  <strong>{order ? formatMoney(balanceAmount) : "—"}</strong>
                  <small>{order ? "Based on linked order" : "Available after acceptance"}</small>
                </div>
              </div>
            </section>

            <section className={detailStyles.primaryLayout}>
              <div className={detailStyles.primaryColumn}>
                <section className={detailStyles.manageCard}>
                  <div className={detailStyles.sectionHeader}>
                    <div>
                      <span>EDIT QUOTATION</span>
                      <h2>Scope, pricing & status</h2>
                      <p>
                        Build the client&apos;s quotation here. Add the agreed
                        items and pricing, then mark it Quoted when it is ready
                        to send. The client chooses the payment option.
                      </p>
                    </div>
                  </div>

                  <form action={updateQuotationRequest}>
                    <input type="hidden" name="id" value={request.id} />

                    <div className={detailStyles.formRowSingle}>
                      <label>
                        <span>Quotation status</span>
                        <div className={detailStyles.selectWrap}>
                          <select name="status" defaultValue={request.status}>
                            <option value="NEW">New</option>
                            <option value="REVIEWING">Reviewing</option>
                            <option value="QUOTED">
                              Quoted — ready for client review
                            </option>
                            <option value="ACCEPTED" disabled>
                              Accepted — client controlled
                            </option>
                            <option value="DECLINED">Declined</option>
                            <option value="CLOSED">Closed</option>
                          </select>
                          <span aria-hidden="true">⌄</span>
                        </div>
                        <small>
                          Accepted is set automatically when the client accepts.
                        </small>
                      </label>

                    </div>

                    <QuotationItemsEditor
                      initialItems={quotationItems}
                      fallbackQuotedAmount={request.quoted_amount}
                    />

                    <label className={detailStyles.notesField}>
                      <span>Client quotation / scope notes</span>
                      <textarea
                        name="admin_notes"
                        rows={6}
                        defaultValue={request.admin_notes ?? ""}
                        placeholder="Add inclusions, exclusions, limitations, special agreements, timeline notes, or anything the client should review."
                      />
                    </label>

                    <button className={detailStyles.saveButton} type="submit">
                      Save Quotation Changes
                    </button>
                  </form>
                </section>

                <section className={detailStyles.requestSection}>
              <div className={detailStyles.requestHeading}>
                <span>ORIGINAL REQUEST</span>
                <h2>Client & project information</h2>
                <p>
                  The original information is kept below for reference. Open
                  only the section you need.
                </p>
              </div>

              <div className={detailStyles.detailsList}>
                <DetailSection
                  eyebrow="CLIENT"
                  title="Contact & project details"
                  description="Basic client, business, and project information."
                >
                  <div className={detailStyles.fieldGrid}>
                    <Field label="Full name" value={request.full_name} />
                    <Field
                      label="Business / project name"
                      value={request.business_name}
                    />
                    <Field label="Email" value={request.email} />
                    <Field
                      label="Mobile / Telegram"
                      value={request.contact_number}
                    />
                    <Field
                      label="Preferred contact"
                      value={request.preferred_contact}
                    />
                    <Field label="Project context" value={request.project_context} />
                    <Field label="Project type" value={request.business_type} />
                    <Field
                      label="Location / audience area"
                      value={request.business_location}
                    />
                    <Field
                      label="Project / business stage"
                      value={request.business_age}
                    />
                    <Field label="Team size" value={request.staff_count} />
                    <Field
                      label="Physical locations"
                      value={request.location_count}
                    />
                    <Field
                      label="Website / social page"
                      value={request.current_link}
                    />
                    <Field
                      label="Already has a website"
                      value={request.existing_website}
                    />
                  </div>

                  <Field
                    label="Project description / products / services / content"
                    value={request.offerings}
                  />
                </DetailSection>

                <DetailSection
                  eyebrow="FUNCTION"
                  title="How the project should work"
                  description="Requested functionality and how the client expects to manage it."
                >
                  <Field
                    label="What users should be able to do"
                    value={request.visitor_actions}
                  />
                  <Field label="Who will use it" value={request.user_types} />
                  <Field label="Account / access setup" value={request.access_model} />
                  <Field
                    label="Admin / owner requirements"
                    value={request.admin_requirements}
                  />
                  <Field
                    label="Device requirements"
                    value={request.device_requirements}
                  />

                  <div className={detailStyles.fieldGrid}>
                    <Field
                      label="Needs to update it themselves"
                      value={request.self_manage}
                    />
                    <Field
                      label="User / customer accounts"
                      value={request.user_accounts}
                    />
                    <Field label="Will sell online" value={request.sell_online} />
                    <Field
                      label="Needs online payments"
                      value={request.online_payments}
                    />
                    <Field
                      label="Needs platform integrations"
                      value={request.integration_needed}
                    />
                  </div>

                  <Field
                    label="Unsure about / wants TCL to recommend"
                    value={request.uncertainty_notes}
                  />
                </DetailSection>

                <DetailSection
                  eyebrow="WORKFLOW"
                  title="Current setup & goals"
                  description="What the client uses now, current problems, and the desired result."
                >
                  <Field
                    label="Current process / setup"
                    value={request.current_process}
                  />
                  <Field
                    label="Main problems / needs"
                    value={request.main_problems}
                  />
                  <Field label="Main project goal" value={request.main_goal} />
                </DetailSection>

                <DetailSection
                  eyebrow="FEATURES"
                  title="Requested features & requirements"
                  description="Potential features selected or mentioned by the client."
                >
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
                      label="Expected activity"
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
                      label="Admin / editor access"
                      value={request.admin_access}
                    />
                  </div>

                  <Field
                    label="Integrations / tools"
                    value={request.integrations}
                  />
                  <Field
                    label="Data / content management"
                    value={request.data_management}
                  />
                  <Field
                    label="Recurring changes"
                    value={request.recurring_changes}
                  />
                  <Field
                    label="Rules / limits / permissions"
                    value={request.usage_rules}
                  />
                  <Field
                    label="Results / reports / tracking"
                    value={request.results_reporting}
                  />
                </DetailSection>

                <DetailSection
                  eyebrow="BRANDING"
                  title="Branding & content readiness"
                  description="Assets, content, domain, and timeline information."
                >
                  <div className={detailStyles.fieldGrid}>
                    <Field label="Logo ready" value={request.logo_ready} />
                    <Field
                      label="Branding ready"
                      value={request.branding_ready}
                    />
                    <Field
                      label="Content ready"
                      value={request.content_ready}
                    />
                    <Field
                      label="Domain status"
                      value={request.domain_status}
                    />
                    <Field label="Timeline" value={request.timeline} />
                    <Field label="Budget" value={request.budget} />
                  </div>

                  <Field label="Additional notes" value={request.notes} />
                </DetailSection>
              </div>
            </section>


                <section className={detailStyles.historySection}>
              <div className={detailStyles.requestHeading}>
                <span>HISTORY</span>
                <h2>Quotation notes & activity</h2>
                <p>
                  Scope notes are for useful project history. Activity is the
                  automatic audit trail.
                </p>
              </div>

              <div className={detailStyles.historyGrid}>
                <section className={detailStyles.historyCard}>
                  <div className={detailStyles.historyHeader}>
                    <div>
                      <span>NOTE LOG · LATEST FIRST</span>
                      <h3>Scope & agreement notes</h3>
                    </div>
                  </div>

                  <form
                    action={addManualQuotationNote}
                    className={detailStyles.noteForm}
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={request.id}
                    />
                    <textarea
                      name="note"
                      rows={3}
                      placeholder="Add a note from Messenger, call, or another client agreement..."
                    />
                    <button type="submit">Add Note</button>
                  </form>

                  <div
                    className={detailStyles.logList}
                    style={{
                      maxHeight: 520,
                      overflowY: "auto",
                      overscrollBehavior: "contain",
                      paddingRight: 6,
                      scrollbarGutter: "stable",
                    }}
                  >
                    {(noteLogs ?? []).length > 0 ? (
                      (noteLogs ?? []).map((log) => (
                        <article
                          key={log.id}
                          className={detailStyles.logItem}
                          style={{ minHeight: 92 }}
                        >
                          <div className={detailStyles.logTop}>
                            <strong>{log.title}</strong>
                            <span>{log.note_type}</span>
                          </div>
                          <p>{log.note}</p>
                          <small>{formatDate(log.created_at)}</small>
                        </article>
                      ))
                    ) : (
                      <div className={detailStyles.emptyText}>
                        No quotation notes yet.
                      </div>
                    )}
                  </div>
                </section>

                <section className={detailStyles.historyCard}>
                  <div className={detailStyles.historyHeader}>
                    <div>
                      <span>ACTIVITY LOG · LATEST FIRST</span>
                      <h3>Automatic audit history</h3>
                    </div>
                  </div>

                  <div
                    className={detailStyles.logList}
                    style={{
                      maxHeight: 520,
                      overflowY: "auto",
                      overscrollBehavior: "contain",
                      paddingRight: 6,
                      scrollbarGutter: "stable",
                    }}
                  >
                    {(activityLogs ?? []).length > 0 ? (
                      (activityLogs ?? []).map((log) => (
                        <article
                          key={log.id}
                          className={detailStyles.logItem}
                          style={{ minHeight: 92 }}
                        >
                          <div className={detailStyles.logTop}>
                            <strong>{log.summary}</strong>
                            <span>{log.action_type}</span>
                          </div>
                          <small>{formatDate(log.created_at)}</small>
                        </article>
                      ))
                    ) : (
                      <div className={detailStyles.emptyText}>
                        No activity recorded yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </section>
              </div>

              <aside className={detailStyles.sideColumn}>
                <section className={detailStyles.clientCard}>
                  <div className={detailStyles.sectionHeader}>
                    <div>
                      <span>CLIENT QUOTATION</span>
                      <h2>Review & send</h2>
                      <p>
                        This is the private quotation page your client will
                        review before accepting.
                      </p>
                    </div>
                  </div>

                  <div className={detailStyles.clientSummary}>
                    <div>
                      <small>Status</small>
                      <strong>{statusLabel(request.status)}</strong>
                    </div>
                    <div>
                      <small>Quotation total</small>
                      <strong>{formatMoney(request.quoted_amount)}</strong>
                    </div>
                    <div>
                      <small>Payment option</small>
                      <strong>
                        {order
                          ? paymentTermsLabel(order.payment_terms)
                          : "Chosen by client at acceptance"}
                      </strong>
                    </div>
                  </div>

                  {clientLinkAvailable ? (
                    <div className={detailStyles.actionStack}>
                      <a
                        className={detailStyles.primaryAction}
                        href={quotationPath}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Preview Client Quotation ↗
                      </a>

                      <div className={detailStyles.copyAction}>
                        <CopyPaymentLinkButton url={quotationUrl} />
                      </div>
                    </div>
                  ) : (
                    <div className={detailStyles.infoBox}>
                      Finish the scope and pricing, then change the status to
                      <strong> Quoted</strong>. The private client link will be
                      ready to send, and the client will choose the payment option.
                    </div>
                  )}
                </section>

                {order ? (
                  <section className={detailStyles.clientCard}>
                    <div className={detailStyles.sectionHeader}>
                      <div>
                        <span>PAYMENT & PROJECT</span>
                        <h2>Accepted quotation</h2>
                        <p>
                          Payment information starts here after the client
                          accepts the quotation.
                        </p>
                      </div>
                    </div>

                    <div className={detailStyles.clientSummary}>
                      <div>
                        <small>Order number</small>
                        <strong>{order.order_number}</strong>
                      </div>
                      <div>
                        <small>Current total</small>
                        <strong>{formatMoney(order.total_amount)}</strong>
                      </div>
                      <div>
                        <small>Customer-selected plan</small>
                        <strong>{paymentTermsLabel(order.payment_terms)}</strong>
                      </div>
                      <div>
                        <small>Paid</small>
                        <strong>{formatMoney(order.amount_paid)}</strong>
                      </div>
                      <div>
                        <small>Remaining</small>
                        <strong>{formatMoney(order.balance_due)}</strong>
                      </div>
                    </div>

                    <div className={detailStyles.actionStack}>
                      <Link
                        className={detailStyles.outlineAction}
                        href={`/admin/orders/${order.id}`}
                      >
                        View Order →
                      </Link>

                      {checkoutUrl && order.payment_status !== "COMPLETED" ? (
                        <>
                          <a
                            className={detailStyles.primaryAction}
                            href={checkoutPath!}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Custom Checkout ↗
                          </a>
                          <div className={detailStyles.copyAction}>
                            <CopyPaymentLinkButton url={checkoutUrl} />
                          </div>
                        </>
                      ) : null}

                      {project ? (
                        <>
                          <Link
                            className={detailStyles.primaryAction}
                            href={`/admin/project-requirements/${project.id}`}
                          >
                            View Project →
                          </Link>
                          <a
                            className={detailStyles.outlineAction}
                            href={`/project-requirements/${project.secure_token}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open Customer Requirements ↗
                          </a>
                        </>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                <section className={detailStyles.metaCard}>
                  <span>RECORD INFO</span>
                  <div>
                    <small>Quotation ID</small>
                    <strong>{request.id}</strong>
                  </div>
                  <div>
                    <small>Created</small>
                    <strong>{formatDate(request.created_at)}</strong>
                  </div>
                  <div>
                    <small>Last updated</small>
                    <strong>{formatDate(request.updated_at)}</strong>
                  </div>
                  {request.accepted_at ? (
                    <div>
                      <small>Accepted</small>
                      <strong>{formatDate(request.accepted_at)}</strong>
                    </div>
                  ) : null}
                </section>

                <section className={`${detailStyles.clientCard} ${detailStyles.deleteCard}`}>
                  <div className={detailStyles.sectionHeader}>
                    <div>
                      <span>DANGER ZONE</span>
                      <h2>Delete quotation</h2>
                      <p>
                        Only use this for quotations that should be permanently removed.
                      </p>
                    </div>
                  </div>

                  {request.order_id ? (
                    <div className={detailStyles.infoBox}>
                      This quotation is already linked to an order, so it cannot be
                      deleted from here.
                    </div>
                  ) : (
                    <form
                      action={deleteQuotationRequest}
                      className={detailStyles.deleteForm}
                    >
                      <input type="hidden" name="id" value={request.id} />

                      <label className={detailStyles.deleteField}>
                        <span>Type DELETE to confirm</span>
                        <input
                          type="text"
                          name="confirmation"
                          placeholder="DELETE"
                          autoComplete="off"
                          required
                        />
                      </label>

                      <p className={detailStyles.deleteHelp}>
                        This permanently removes the quotation, quotation items,
                        Note Log, and Activity Log.
                      </p>

                      <button
                        className={detailStyles.deleteButton}
                        type="submit"
                      >
                        Delete Quotation
                      </button>
                    </form>
                  )}
                </section>
              </aside>
            </section>

          </div>
        </section>
      </div>
    </main>
  );
}
