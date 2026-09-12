import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import AdminNav from "@/app/admin/AdminNav";
import CopyPaymentLinkButton from "./CopyPaymentLinkButton";
import detailStyles from "./quotation-detail.module.css";
import { deleteQuotationRequest, updateQuotationRequest } from "../actions";

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
  if (value === null || value === "") return "Not quoted yet";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function statusLabel(status: string) {
  switch (status) {
    case "NEW": return "New";
    case "REVIEWING": return "Reviewing";
    case "QUOTED": return "Quoted";
    case "ACCEPTED": return "Accepted";
    case "DECLINED": return "Declined";
    case "CLOSED": return "Closed";
    default: return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "NEW": return detailStyles.statusNew;
    case "REVIEWING": return detailStyles.statusReviewing;
    case "QUOTED": return detailStyles.statusQuoted;
    case "ACCEPTED": return detailStyles.statusAccepted;
    case "DECLINED": return detailStyles.statusDeclined;
    case "CLOSED": return detailStyles.statusClosed;
    default: return detailStyles.statusClosed;
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

  if (!user) redirect("/admin/login");

  const { id } = await params;
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

    if (orderError) console.error("Quotation linked order load error:", orderError);
    else order = orderData;

    const { data: projectData, error: projectError } = await adminSupabase
      .from("project_requirements")
      .select("id,secure_token,requirements_status,project_status")
      .eq("order_id", request.order_id)
      .maybeSingle();

    if (projectError) console.error("Quotation linked project load error:", projectError);
    else project = projectData;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
  const quotationPath = `/quotation/${request.secure_token}`;
  const quotationUrl = siteUrl ? `${siteUrl}${quotationPath}` : quotationPath;
  const checkoutPath = order?.receipt_token
    ? `/checkout/custom/${order.receipt_token}`
    : null;
  const checkoutUrl =
    checkoutPath && siteUrl ? `${siteUrl}${checkoutPath}` : checkoutPath;

  return (
    <main className="store-admin-dashboard">
      <div className="store-admin-dashboard-shell">
        <AdminNav active="quotations" email={user.email} />

        <section className="store-admin-main">
          <div className={detailStyles.page}>
            <header className={detailStyles.topbar}>
              <div className={detailStyles.heading}>
                <span className={detailStyles.eyebrow}>QUOTATION DETAILS</span>
                <h1>{request.business_name || "Quotation Request"}</h1>
                <p>
                  {request.product_name} · Submitted {formatDate(request.created_at)}
                </p>
              </div>

              <Link
                className={detailStyles.backButton}
                href="/admin/quotation-requests"
              >
                ← All Quotations
              </Link>
            </header>

            <section className={detailStyles.summaryGrid}>
              <article className={detailStyles.summaryCard}>
                <div className={detailStyles.summaryTop}>
                  <span>STATUS</span>
                  <div className={detailStyles.summaryIcon}>✦</div>
                </div>
                <span
                  className={`${detailStyles.statusBadge} ${statusClass(request.status)}`}
                >
                  {statusLabel(request.status)}
                </span>
                <small>Current quotation stage</small>
              </article>

              <article className={detailStyles.summaryCard}>
                <div className={detailStyles.summaryTop}>
                  <span>BUDGET</span>
                  <div className={detailStyles.summaryIcon}>₱</div>
                </div>
                <strong>{request.budget || "—"}</strong>
                <small>Customer&apos;s estimated budget</small>
              </article>

              <article className={detailStyles.summaryCard}>
                <div className={detailStyles.summaryTop}>
                  <span>QUOTED AMOUNT</span>
                  <div className={detailStyles.summaryIcon}>◇</div>
                </div>
                <strong>{formatMoney(request.quoted_amount)}</strong>
                <small>
                  {request.quoted_at
                    ? `Quoted ${formatDate(request.quoted_at)}`
                    : "No quotation amount has been set yet"}
                </small>
              </article>
            </section>

            <section className={detailStyles.layout}>
              <div className={detailStyles.mainColumn}>
                <section className={detailStyles.card}>
                  <div className={detailStyles.cardHeader}>
                    <span>CUSTOMER</span>
                    <h2>Contact & project details</h2>
                    <p>Who submitted the request and what they are building.</p>
                  </div>

                  <div className={detailStyles.fieldGrid}>
                    <Field label="Full name" value={request.full_name} />
                    <Field label="Business / project name" value={request.business_name} />
                    <Field label="Email" value={request.email} />
                    <Field label="Mobile / Telegram" value={request.contact_number} />
                    <Field label="Preferred contact" value={request.preferred_contact} />
                    <Field label="Project type" value={request.business_type} />
                    <Field label="Location / audience area" value={request.business_location} />
                    <Field label="Project / business stage" value={request.business_age} />
                    <Field label="Team size" value={request.staff_count} />
                    <Field label="Physical locations" value={request.location_count} />
                    <Field label="Website / social page" value={request.current_link} />
                    <Field label="Already has a website" value={request.existing_website} />
                  </div>

                  <Field
                    label="Website purpose / products / services / content"
                    value={request.offerings}
                  />
                </section>

                <section className={detailStyles.card}>
                  <div className={detailStyles.cardHeader}>
                    <span>FUNCTION</span>
                    <h2>How the website should work</h2>
                    <p>Direct answers that help determine the actual project scope.</p>
                  </div>

                  <Field
                    label="What visitors should be able to do"
                    value={request.visitor_actions}
                  />

                  <div className={detailStyles.fieldGrid}>
                    <Field
                      label="Needs to update website themselves"
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
                </section>

                <section className={detailStyles.card}>
                  <div className={detailStyles.cardHeader}>
                    <span>WORKFLOW</span>
                    <h2>Current setup & goals</h2>
                    <p>What the customer currently uses and what they want to improve.</p>
                  </div>

                  <Field label="Current process / setup" value={request.current_process} />
                  <Field label="Main problems / needs" value={request.main_problems} />
                  <Field label="Main project goal" value={request.main_goal} />
                </section>

                <section className={detailStyles.card}>
                  <div className={detailStyles.cardHeader}>
                    <span>REQUIREMENTS</span>
                    <h2>Requested pages & features</h2>
                    <p>Potential functionality selected by the customer.</p>
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
                    <Field label="Expected activity" value={request.expected_volume} />
                    <Field label="Payment methods" value={request.payment_methods} />
                    <Field label="Delivery / fulfillment" value={request.delivery_needs} />
                    <Field label="Admin / editor access" value={request.admin_access} />
                  </div>

                  <Field label="Integrations / tools" value={request.integrations} />
                </section>

                <section className={detailStyles.card}>
                  <div className={detailStyles.cardHeader}>
                    <span>BRANDING</span>
                    <h2>Branding & content readiness</h2>
                    <p>Assets already available and what may still need preparation.</p>
                  </div>

                  <div className={detailStyles.fieldGrid}>
                    <Field label="Logo ready" value={request.logo_ready} />
                    <Field label="Branding ready" value={request.branding_ready} />
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
                    <h2>Prepare quotation</h2>
                    <p>
                      Set the final scope and price, then mark it Quoted. The client
                      chooses their payment option from the private quotation link.
                    </p>
                  </div>

                  <form action={updateQuotationRequest}>
                    <input type="hidden" name="id" value={request.id} />

                    <label>
                      Status
                      <select name="status" defaultValue={request.status}>
                        <option value="NEW">New</option>
                        <option value="REVIEWING">Reviewing</option>
                        <option value="QUOTED">Quoted — ready for client review</option>
                        <option value="ACCEPTED" disabled>
                          Accepted — client controlled
                        </option>
                        <option value="DECLINED">Declined</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </label>

                    <label>
                      Quoted amount
                      <div className={detailStyles.moneyInput}>
                        <span>₱</span>
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
                      </div>
                    </label>


                    <label>
                      Quotation / scope notes
                      <textarea
                        name="admin_notes"
                        rows={8}
                        defaultValue={request.admin_notes ?? ""}
                        placeholder="Scope, included features, special notes, exclusions, or anything the client should see before accepting..."
                      />
                    </label>

                    <button type="submit">Save Changes</button>
                  </form>
                </section>

                <section className={detailStyles.paymentCard}>
                  <div className={detailStyles.cardHeader}>
                    <span>CLIENT QUOTATION</span>
                    <h2>Private review link</h2>
                    <p>
                      Send this link after the quotation is ready. The client can
                      review it, accept it, or decide later.
                    </p>
                  </div>

                  <div className={detailStyles.paymentMeta}>
                    <div>
                      <small>Quoted amount</small>
                      <strong>{formatMoney(request.quoted_amount)}</strong>
                    </div>
                    <div>
                      <small>Client status</small>
                      <strong>{statusLabel(request.status)}</strong>
                    </div>
                  </div>

                  {request.status === "QUOTED" ||
                  request.status === "ACCEPTED" ? (
                    <div className={detailStyles.actionStack}>
                      <a
                        className={detailStyles.primaryAction}
                        href={quotationPath}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Client Quotation ↗
                      </a>

                      <div className={detailStyles.copyAction}>
                        <CopyPaymentLinkButton url={quotationUrl} />
                      </div>
                    </div>
                  ) : (
                    <div className={detailStyles.infoBox}>
                      Set the final amount and change the status to
                      <strong> Quoted</strong>. Then send the private review link
                      to the client so they can choose their payment option.
                    </div>
                  )}
                </section>

                {order ? (
                  <section className={detailStyles.paymentCard}>
                    <div className={detailStyles.cardHeader}>
                      <span>PAYMENT & PROJECT</span>
                      <h2>Accepted quotation</h2>
                      <p>
                        The client accepted this quotation and the custom project
                        order was created automatically.
                      </p>
                    </div>

                    <div className={detailStyles.paymentMeta}>
                      <div>
                        <small>Order number</small>
                        <strong>{order.order_number}</strong>
                      </div>
                      <div>
                        <small>Payment</small>
                        <strong>{order.payment_status}</strong>
                      </div>
                      <div>
                        <small>Total</small>
                        <strong>{formatMoney(order.total_amount)}</strong>
                      </div>
                      <div>
                        <small>Amount paid</small>
                        <strong>{formatMoney(order.amount_paid)}</strong>
                      </div>
                      <div>
                        <small>Balance</small>
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
                      ) : (
                        <div className={detailStyles.infoBox}>
                          Project Requirements will be prepared by the paid-project
                          workflow after the required payment stage is completed.
                        </div>
                      )}
                    </div>
                  </section>
                ) : null}

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

                  {request.accepted_at ? (
                    <div>
                      <small>Accepted</small>
                      <strong>{formatDate(request.accepted_at)}</strong>
                    </div>
                  ) : null}
                </section>

                <section
                  className={detailStyles.metaCard}
                  style={{
                    borderColor: "#e9b8c4",
                    background: "#fff8fa",
                  }}
                >
                  <span style={{ color: "#a33c56" }}>DANGER ZONE</span>
                  <div>
                    <small>Delete quotation</small>
                    <strong>
                      {request.order_id
                        ? "Unavailable — linked to an order"
                        : "Permanently remove this quotation"}
                    </strong>
                  </div>

                  {request.order_id ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.72rem",
                        lineHeight: 1.6,
                        color: "#8b5a66",
                      }}
                    >
                      This quotation is already part of an order/payment record, so
                      it cannot be deleted here.
                    </p>
                  ) : (
                    <form action={deleteQuotationRequest}>
                      <input type="hidden" name="id" value={request.id} />

                      <label
                        style={{
                          display: "grid",
                          gap: 7,
                          marginTop: 10,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                        }}
                      >
                        Type DELETE to confirm
                        <input
                          type="text"
                          name="confirmation"
                          placeholder="DELETE"
                          autoComplete="off"
                          required
                          style={{
                            width: "100%",
                            minHeight: 42,
                            border: "1px solid #dfb2bd",
                            borderRadius: 10,
                            padding: "0 12px",
                            background: "#fff",
                          }}
                        />
                      </label>

                      <button
                        type="submit"
                        style={{
                          width: "100%",
                          minHeight: 42,
                          marginTop: 10,
                          border: "1px solid #b74460",
                          borderRadius: 10,
                          background: "#b74460",
                          color: "#fff",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Delete Quotation
                      </button>

                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: "0.65rem",
                          lineHeight: 1.5,
                          color: "#8b5a66",
                        }}
                      >
                        This permanently deletes the quotation together with its
                        quotation items, Activity Log, and Note Log.
                      </p>
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
