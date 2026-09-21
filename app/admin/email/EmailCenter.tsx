"use client";

import { FormEvent, useMemo, useState } from "react";
import type { EmailHistoryRow, EmailRecord } from "./page";
import styles from "./email.module.css";

type TemplateKey =
  | "CUSTOM"
  | "GENERAL"
  | "QUOTATION_REVIEW"
  | "QUOTATION_READY"
  | "QUOTATION_UPDATED"
  | "PAYMENT_REMINDER"
  | "PAYMENT_PROOF_RECEIVED"
  | "PAYMENT_CONFIRMED"
  | "ORDER_RECEIVED"
  | "ORDER_UPDATE"
  | "PROJECT_STARTED"
  | "PROJECT_IN_PROGRESS"
  | "REQUIREMENTS_NEEDED"
  | "READY_FOR_DELIVERY"
  | "PROJECT_COMPLETED"
  | "TURNOVER"
  | "FOLLOW_UP";

type Template = {
  label: string;
  subject: (record?: EmailRecord) => string;
  message: (record?: EmailRecord) => string;
  ctaLabel: string;
  preferredType?: EmailRecord["type"];
};

const first = (record?: EmailRecord) =>
  record?.name?.trim().split(/\s+/)[0] || "there";
const ref = (record?: EmailRecord) =>
  record?.reference ? ` (${record.reference})` : "";
const project = (record?: EmailRecord) => record?.title || "your project";

const TEMPLATES: Record<TemplateKey, Template> = {
  CUSTOM: {
    label: "Custom Message",
    subject: () => "",
    message: () => "",
    ctaLabel: "",
  },
  GENERAL: {
    label: "General Message",
    subject: () => "TCL Systems & Digitals PH - Client Update",
    message: (r) =>
      `Hi ${first(r)},\n\nWe hope you’re doing well. We’re reaching out from TCL Systems & Digitals PH regarding ${project(r)}.\n\nPlease take a moment to review this message and any information provided with it. If anything is unclear or you need assistance, you’re welcome to contact us through Telegram @tclsystemsanddigitalsph.\n\nThank you for your time and for choosing TCL Systems & Digitals PH.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "",
  },
  QUOTATION_REVIEW: {
    label: "Quotation — Under Review",
    subject: () => "TCL Systems & Digitals PH - Quote Request Under Review",
    message: (r) =>
      `Hi ${first(r)},\n\nThank you for submitting your quotation request for ${project(r)}. We’ve received your details and your request is now under review.\n\nWe’re carefully reviewing the information you provided, including the requested scope, features, and project requirements, so we can prepare a quotation that accurately reflects what your project needs.\n\nThere’s nothing you need to do at the moment. If we need any clarification before preparing the quotation, we’ll get in touch. Otherwise, you’ll receive another notification as soon as your quotation is ready for review.\n\nThank you for considering TCL Systems & Digitals PH for your project.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "",
    preferredType: "QUOTATION",
  },
  QUOTATION_READY: {
    label: "Quotation — Ready",
    subject: () => "TCL Systems & Digitals PH - Quote Request Is Ready",
    message: (r) =>
      `Hi ${first(r)},\n\nWe’re pleased to let you know that your quotation for ${project(r)} is ready for review.\n\nYour private quotation page includes the proposed project scope, included items or features, pricing, quotation total, and the payment options currently available for your project. Please review everything carefully to make sure the details match what you discussed or requested.\n\nIf everything looks good, you can accept the quotation directly from the page and continue to the next step. Accepting the quotation confirms the current scope and pricing shown there.\n\nIf you have a question or would like something clarified before accepting, please contact us through Telegram @tclsystemsanddigitalsph and we’ll be happy to assist.\n\nThank you for the opportunity to work on your project.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "View Quotation",
    preferredType: "QUOTATION",
  },
  QUOTATION_UPDATED: {
    label: "Quotation — Updated",
    subject: () => "TCL Systems & Digitals PH - Quotation Updated",
    message: (r) =>
      `Hi ${first(r)},\n\nWe wanted to let you know that your quotation for ${project(r)} has been updated.\n\nThe private quotation page now reflects the latest scope, pricing, project notes, and applicable payment information. Any previous version should be considered superseded by the details currently shown on your quotation page.\n\nPlease review the updated quotation carefully before accepting it. If the changes are clear and everything looks correct, you may continue directly from the private quotation page. If you have any questions about the revised scope or pricing, please contact us through Telegram @tclsystemsanddigitalsph before proceeding.\n\nThank you for reviewing the update.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "View Updated Quotation",
    preferredType: "QUOTATION",
  },
  PAYMENT_REMINDER: {
    label: "Payment Reminder",
    subject: () => "TCL Systems & Digitals PH - Payment Reminder",
    message: (r) =>
      `Hi ${first(r)},\n\nWe hope you’re doing well. This is a friendly reminder that a payment related to ${project(r)} is still showing as pending in our records.\n\nYou can review your current order or quotation for the applicable amount, selected payment option, and next step. If you recently submitted proof for a direct bank transfer, please allow time for verification and avoid submitting the same proof again while it is being reviewed.\n\nOnline payments are recorded once the payment provider confirms the transaction. Direct bank transfers are considered confirmed only after the submitted payment proof has been reviewed and verified by TCL Systems & Digitals PH.\n\nIf your payment has already been completed and confirmed after this message was sent, you may simply disregard this reminder. If you need help, please contact us through Telegram @tclsystemsanddigitalsph.\n\nThank you,\nTCL Systems & Digitals PH`,
    ctaLabel: "Check Order Status",
  },
  PAYMENT_PROOF_RECEIVED: {
    label: "Payment Proof Received",
    subject: () => "TCL Systems & Digitals PH - Payment Proof Received",
    message: (r) =>
      `Hi ${first(r)},\n\nThank you. We’ve successfully received the payment proof you submitted for ${project(r)}.\n\nYour submission is now queued for verification. At this stage, the payment is still marked as pending; submitting a proof does not automatically mark the transaction as paid. Once the payment details have been reviewed and verified, we’ll send you a separate payment confirmation.\n\nThere’s no need to upload the same proof again while verification is in progress. You can continue to check your Order Status page for the latest recorded payment and project information.\n\nThank you for your patience.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "Check Order Status",
    preferredType: "ORDER",
  },
  PAYMENT_CONFIRMED: {
    label: "Payment Confirmed",
    subject: () => "TCL Systems & Digitals PH - Payment Confirmed",
    message: (r) =>
      `Hi ${first(r)},\n\nWe’re happy to confirm that your payment for ${project(r)} has been successfully verified and recorded.\n\nYour payment status has now been updated in our system. If your project is ready to proceed, it will continue according to the agreed scope, current requirements, and applicable project timeline. Please note that payment confirmation and project completion are tracked separately, so the project status may continue to change as work progresses.\n\nYou can use the Order Status page below at any time to review your latest payment status, project progress, requirements, delivery information, and available access details.\n\nThank you for your payment and for choosing TCL Systems & Digitals PH. We appreciate the opportunity to work with you.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "Check Order Status",
    preferredType: "ORDER",
  },
  ORDER_RECEIVED: {
    label: "Order Received",
    subject: () => "TCL Systems & Digitals PH - Order Received",
    message: (r) =>
      `Hi ${first(r)},\n\nThank you for your order. We’ve received your request for ${project(r)} and it has been recorded in our system.\n\nYour order record keeps payment status, project progress, requirements, delivery, and access information organized separately. This means an order may be received while payment or project work is still pending.\n\nYou can use the Order Status page below whenever you’d like to check the latest information. We’ll also send you a notification when there is an important update or when something requires your attention.\n\nThank you for choosing TCL Systems & Digitals PH.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "Check Order Status",
    preferredType: "ORDER",
  },
  ORDER_UPDATE: {
    label: "Order Update",
    subject: () => "TCL Systems & Digitals PH - Order Status Update",
    message: (r) =>
      `Hi ${first(r)},\n\nWe wanted to let you know that there has been an update to your order for ${project(r)}.\n\nYour Order Status page contains the most recent information recorded for your order, including payment status, project progress, outstanding requirements, delivery status, and any available digital-access details.\n\nPlease use the button below to review the current status. If the update requires information, files, approval, or another action from you, please follow the instructions provided with your order. If you need clarification, you can contact us through Telegram @tclsystemsanddigitalsph.\n\nThank you for your continued cooperation.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "Check Order Status",
    preferredType: "ORDER",
  },
  PROJECT_STARTED: {
    label: "Project Started",
    subject: () => "TCL Systems & Digitals PH - Your Project Has Started",
    message: (r) =>
      `Hi ${first(r)},\n\nWe’re pleased to let you know that work on ${project(r)} has officially started.\n\nYour project is now part of our active production workflow and will move forward based on the confirmed scope and the materials currently available to us. During development, we may contact you if we need additional content, account access, files, clarification, or approval to complete a particular stage.\n\nYou can use the Order Status page below to monitor the latest recorded project progress and see whether there are any requirements that need your attention. Payment status and project progress are tracked separately for clarity.\n\nThank you for trusting TCL Systems & Digitals PH with your project. We look forward to bringing it together for you.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "Check Order Status",
    preferredType: "ORDER",
  },
  PROJECT_IN_PROGRESS: {
    label: "Project In Progress",
    subject: () => "TCL Systems & Digitals PH - Project Progress Update",
    message: (r) =>
      `Hi ${first(r)},\n\nHere’s a quick update on ${project(r)}: your project is currently in progress.\n\nDevelopment is continuing based on the agreed scope and the information and materials currently available to us. Unless we have specifically requested additional content, credentials, feedback, or approval from you, there is nothing you need to do at this stage.\n\nYou can check the Order Status page below for the latest recorded progress. We’ll keep you informed when the project reaches another important milestone or whenever your input is needed.\n\nThank you for your patience while we work on your project.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "Check Order Status",
    preferredType: "ORDER",
  },
  REQUIREMENTS_NEEDED: {
    label: "Requirements Needed",
    subject: () => "TCL Systems & Digitals PH - Project Requirements Needed",
    message: (r) =>
      `Hi ${first(r)},\n\nWe’re reaching out because we need additional information or project materials before we can continue with ${project(r)}.\n\nPlease review the current requirements for your project and provide the requested content, files, credentials, confirmation, or other information as soon as you’re able. Work that depends on these requirements may remain pending until the necessary items are received.\n\nProviding the requirements promptly helps us keep the project moving and reduces avoidable delays. You can check the latest recorded status using the button below.\n\nIf you’re unsure about what needs to be submitted, please contact us through Telegram @tclsystemsanddigitalsph and we’ll be happy to clarify.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "Check Order Status",
    preferredType: "ORDER",
  },
  READY_FOR_DELIVERY: {
    label: "Ready for Delivery",
    subject: () => "TCL Systems & Digitals PH - Project Ready for Delivery",
    message: (r) =>
      `Hi ${first(r)},\n\nWe’re happy to let you know that ${project(r)} has reached the delivery stage.\n\nPlease review your Order Status page for the latest delivery, access, download, or turnover information currently available for your project. Depending on the package and project type, some credentials, files, documentation, or final instructions may be provided separately.\n\nOnce you receive your project materials, please review them carefully and keep all credentials, account information, source files, and documentation in a secure location. If anything appears to be missing or you need clarification about the turnover, contact us through Telegram @tclsystemsanddigitalsph.\n\nThank you for working with TCL Systems & Digitals PH.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "Check Order Status",
    preferredType: "ORDER",
  },
  PROJECT_COMPLETED: {
    label: "Project Completed",
    subject: () => "TCL Systems & Digitals PH - Project Completed",
    message: (r) =>
      `Hi ${first(r)},\n\nWe’re pleased to let you know that ${project(r)} has been marked as completed in our system.\n\nPlease keep your project files, account credentials, turnover documentation, and order information in a safe place for future reference. Any maintenance or support period included with your package will follow the scope and terms associated with your purchase and is tracked separately from the project’s completion status.\n\nYou can continue to use the Order Status page below to review any available delivery or access information connected to this order. If you have a question regarding the completed project or turnover materials, please contact us through Telegram @tclsystemsanddigitalsph.\n\nThank you for trusting TCL Systems & Digitals PH with your project. We truly appreciate your business and hope to work with you again in the future.\n\nWarm regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "Check Order Status",
    preferredType: "ORDER",
  },
  TURNOVER: {
    label: "Turnover / Access Details",
    subject: () => "TCL Systems & Digitals PH - Project Turnover Details",
    message: (r) =>
      `Hi ${first(r)},\n\nWe’re happy to let you know that ${project(r)} is ready for turnover.\n\nYour project is now at the stage where the applicable files, access information, credentials, documentation, or final project details can be handed over. Please review the available delivery information carefully and save all materials in a secure location once received.\n\nFor account-based projects, we recommend updating any temporary passwords or access credentials after turnover whenever appropriate. Please also keep a backup of important project files and documentation for your records.\n\nIf you have any questions about the turnover or need clarification on the materials provided, contact us through Telegram @tclsystemsanddigitalsph.\n\nThank you for choosing TCL Systems & Digitals PH.\n\nWarm regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "Check Order Status",
    preferredType: "ORDER",
  },
  FOLLOW_UP: {
    label: "Follow-up",
    subject: () => "TCL Systems & Digitals PH - Follow-Up",
    message: (r) =>
      `Hi ${first(r)},\n\nWe hope you’re doing well. We’re following up regarding ${project(r)} and wanted to check in regarding the current next step.\n\nWhen you have a moment, please review the latest information previously provided. If you have already completed the requested action, no further response is necessary unless you need assistance.\n\nIf you have any questions, need clarification, or would like help with the next step, you’re welcome to contact us through Telegram @tclsystemsanddigitalsph.\n\nThank you, and we look forward to hearing from you when you’re ready.\n\nBest regards,\nTCL Systems & Digitals PH`,
    ctaLabel: "",
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

export default function EmailCenter({
  records,
  initialHistory,
}: {
  records: EmailRecord[];
  initialHistory: EmailHistoryRow[];
}) {
  const [tab, setTab] = useState<"COMPOSE" | "HISTORY">("COMPOSE");
  const [recordKey, setRecordKey] = useState("");
  const [templateKey, setTemplateKey] = useState<TemplateKey>("CUSTOM");
  const [name, setName] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [emailHeading, setEmailHeading] = useState("");
  const [message, setMessage] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [history, setHistory] = useState(initialHistory);
  const [openHistory, setOpenHistory] = useState<EmailHistoryRow | null>(null);

  const selectedRecord = useMemo(
    () => records.find((item) => item.key === recordKey),
    [records, recordKey],
  );

  const orderStatusUrl = "https://www.tclsystemsph.com/order-status";

  function applyTemplate(key: TemplateKey, record = selectedRecord) {
    const template = TEMPLATES[key];
    const recipientRecord =
      record ||
      (name.trim()
        ? ({
            name: name.trim(),
            title: selectedRecord?.title,
          } as EmailRecord)
        : undefined);

    setTemplateKey(key);
    setSubject(template.subject(recipientRecord));
    setEmailHeading("");
    setMessage(template.message(recipientRecord));

    // Show the intended CTA immediately when the template includes one.
    setButtonLabel(template.ctaLabel);

    if (!template.ctaLabel) {
      setButtonUrl("");
    } else if (template.preferredType === "QUOTATION") {
      // Private quotation links require a selected quotation record.
      setButtonUrl(record?.type === "QUOTATION" ? record.ctaUrl : "");
    } else if (template.preferredType === "ORDER") {
      // Order Status is a public tracker, so it can be prefilled immediately.
      setButtonUrl(
        record?.type === "ORDER" && record.ctaUrl
          ? record.ctaUrl
          : orderStatusUrl,
      );
    } else if (record?.ctaUrl) {
      setButtonUrl(record.ctaUrl);
    } else {
      setButtonUrl("");
    }
  }

  function updateRecipientName(value: string) {
    const previousFirstName = name.trim().split(/\s+/)[0] || "there";
    const nextFirstName = value.trim().split(/\s+/)[0] || "there";

    setName(value);

    if (templateKey !== "CUSTOM") {
      setMessage((current) => {
        const greeting = `Hi ${previousFirstName},`;
        if (!current.startsWith(greeting)) return current;
        return `Hi ${nextFirstName},${current.slice(greeting.length)}`;
      });
    }
  }

  function selectRecord(key: string) {
    setRecordKey(key);
    const record = records.find((item) => item.key === key);

    if (!record) {
      setName("");
      setTo("");
      if (templateKey !== "CUSTOM") applyTemplate(templateKey, undefined);
      return;
    }

    setName(record.name);
    setTo(record.email);
    if (templateKey !== "CUSTOM") applyTemplate(templateKey, record);
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          to,
          subject,
          emailHeading: templateKey === "CUSTOM" ? emailHeading : "",
          message,
          templateType: templateKey,
          buttonLabel,
          buttonUrl,
          relatedType: selectedRecord?.type || null,
          relatedId: selectedRecord?.id || null,
          relatedReference: selectedRecord?.reference || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Unable to send email.");

      setResult({ ok: true, text: `Sent successfully to ${to}.` });
      if (data.history) setHistory((current) => [data.history, ...current]);
    } catch (error) {
      setResult({
        ok: false,
        text: error instanceof Error ? error.message : "Unable to send email.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className={styles.tabs}>
        <button
          type="button"
          className={tab === "COMPOSE" ? styles.tabActive : ""}
          onClick={() => setTab("COMPOSE")}
        >
          Compose
        </button>
        <button
          type="button"
          className={tab === "HISTORY" ? styles.tabActive : ""}
          onClick={() => setTab("HISTORY")}
        >
          Sent History <span>{history.length}</span>
        </button>
      </div>

      {tab === "COMPOSE" ? (
        <form className={styles.compose} onSubmit={send}>
          <div className={styles.row3}>
            <label>
              <span>Related record</span>
              <select value={recordKey} onChange={(e) => selectRecord(e.target.value)}>
                <option value="">Manual recipient</option>
                <optgroup label="Orders">
                  {records.filter((r) => r.type === "ORDER").map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.reference} · {r.name} · {r.title}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Quotations">
                  {records.filter((r) => r.type === "QUOTATION").map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.name} · {r.title} · {r.status}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>

            <label>
              <span>Template</span>
              <select
                value={templateKey}
                onChange={(e) => applyTemplate(e.target.value as TemplateKey)}
              >
                {Object.entries(TEMPLATES).map(([key, template]) => (
                  <option key={key} value={key}>
                    {template.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Recipient</span>
              <input
                type="email"
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="name@example.com"
              />
            </label>
          </div>

          <div className={styles.row2}>
            <label>
              <span>Recipient name</span>
              <input
                value={name}
                onChange={(e) => updateRecipientName(e.target.value)}
                placeholder="Name"
              />
            </label>

            <label>
              <span>Subject</span>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </label>
          </div>

          {templateKey === "CUSTOM" ? (
            <label>
              <span>Email Heading</span>
              <input
                required
                value={emailHeading}
                onChange={(e) => setEmailHeading(e.target.value)}
                placeholder="Heading shown inside the email"
              />
            </label>
          ) : null}

          <label>
            <span>Message</span>
            <textarea
              required
              rows={9}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
            />
          </label>

          <div className={styles.ctaBlock}>
            <div className={styles.ctaHeader}>
              <div>
                <span>EMAIL ACTION BUTTON</span>
                <strong>
                  {buttonLabel && buttonUrl
                    ? `Included: ${buttonLabel}`
                    : buttonLabel
                      ? `Button ready: ${buttonLabel}`
                      : "No button included"}
                </strong>
              </div>
              <small>
                {buttonLabel && buttonUrl
                  ? "This button will appear in the email."
                  : buttonLabel
                    ? templateKey === "QUOTATION_READY" ||
                      templateKey === "QUOTATION_UPDATED"
                      ? "Select the correct quotation to generate its private link."
                      : "A destination is required before this button can be included."
                    : "This template does not include an action button by default."}
              </small>
            </div>

            <div className={styles.ctaRow}>
              <label>
                <span>Button label</span>
                <input
                  value={buttonLabel}
                  onChange={(e) => setButtonLabel(e.target.value)}
                  placeholder="No button"
                />
              </label>
              <label className={styles.urlField}>
                <span>Button destination</span>
                <input
                  type="url"
                  value={buttonUrl}
                  onChange={(e) => setButtonUrl(e.target.value)}
                  placeholder="No destination"
                />
              </label>
            </div>
          </div>

          <div className={styles.footerRow}>
            <div>
              {result ? (
                <p className={result.ok ? styles.success : styles.error}>
                  {result.text}
                </p>
              ) : (
                <p className={styles.hint}>
                  Notification-only · Support via Telegram @tclsystemsanddigitalsph
                </p>
              )}
            </div>
            <button type="submit" disabled={sending}>
              {sending ? "Sending..." : "Send Email →"}
            </button>
          </div>
        </form>
      ) : (
        <section className={styles.history}>
          {history.length ? (
            <div className={styles.historyList}>
              {history.map((item) => (
                <button
                  type="button"
                  className={styles.historyItem}
                  key={item.id}
                  onClick={() => setOpenHistory(item)}
                >
                  <div>
                    <strong>{item.subject}</strong>
                    <span>
                      {item.recipient_name || "Recipient"} · {item.recipient_email}
                    </span>
                  </div>
                  <div className={styles.historyMeta}>
                    <span>{item.template_type.replaceAll("_", " ")}</span>
                    <span className={item.send_status === "SENT" ? styles.sent : styles.failed}>
                      {item.send_status}
                    </span>
                    <small>{formatDate(item.sent_at)}</small>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>No sent emails yet.</div>
          )}
        </section>
      )}

      {openHistory ? (
        <div className={styles.modalBackdrop} onClick={() => setOpenHistory(null)}>
          <article className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <span>SENT MESSAGE</span>
                <h2>{openHistory.subject}</h2>
              </div>
              <button type="button" onClick={() => setOpenHistory(null)}>×</button>
            </div>

            <div className={styles.modalMeta}>
              <div><span>TO</span><strong>{openHistory.recipient_name || "—"} · {openHistory.recipient_email}</strong></div>
              <div><span>SENT</span><strong>{formatDate(openHistory.sent_at)}</strong></div>
              <div><span>TEMPLATE</span><strong>{openHistory.template_type.replaceAll("_", " ")}</strong></div>
              <div><span>STATUS</span><strong>{openHistory.send_status}</strong></div>
            </div>

            <div className={styles.fullMessage}>{openHistory.message}</div>

            {openHistory.button_label && openHistory.button_url ? (
              <div className={styles.savedCta}>
                <span>CTA</span>
                <strong>{openHistory.button_label}</strong>
                <small>{openHistory.button_url}</small>
              </div>
            ) : null}
          </article>
        </div>
      ) : null}
    </>
  );
}
