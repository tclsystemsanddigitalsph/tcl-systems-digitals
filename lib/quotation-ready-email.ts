import { tclEmailShell } from "@/lib/tcl-email-template";

type QuotationReadyEmailInput = {
  customerName?: string | null;
  customerEmail: string;
  quotationReference: string;
  projectName?: string | null;
  businessName?: string | null;
  quotedAmount: number;
  quotationUrl: string;
  quotedAt?: string | null;
};

function money(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(date);
}

export function buildQuotationReadyEmail({
  customerName,
  customerEmail,
  quotationReference,
  projectName,
  businessName,
  quotedAmount,
  quotationUrl,
  quotedAt,
}: QuotationReadyEmailInput) {
  const firstName = customerName?.trim()
    ? customerName.trim().split(/\s+/)[0]
    : null;

  const displayProject =
    businessName?.trim() ||
    projectName?.trim() ||
    "Custom Project";

  const preparedDate = formatDate(quotedAt);

  const message = firstName
    ? `Hi ${firstName}, your quotation is ready for review. Please check the agreed scope and pricing before choosing your preferred payment option.`
    : "Your quotation is ready for review. Please check the agreed scope and pricing before choosing your preferred payment option.";

  const details = [
    { label: "Quotation Reference", value: quotationReference },
    { label: "Project", value: displayProject },
    { label: "Quoted Amount", value: money(quotedAmount) },
    ...(preparedDate
      ? [{ label: "Prepared", value: preparedDate }]
      : []),
    { label: "Status", value: "Ready for Review" },
  ];

  const html = tclEmailShell({
    eyebrow: "QUOTATION READY",
    title: "Your Quotation Is Ready",
    message,
    details,
    buttonLabel: "View Quotation",
    buttonUrl: quotationUrl,
    note:
      "Your private quotation page contains the latest agreed scope and pricing. From there, you can review the quotation and choose your payment option when you are ready.",
  });

  const text = [
    "TCL Systems & Digitals PH",
    "",
    "Your Quotation Is Ready",
    message,
    "",
    `Quotation Reference: ${quotationReference}`,
    `Project: ${displayProject}`,
    `Quoted Amount: ${money(quotedAmount)}`,
    ...(preparedDate ? [`Prepared: ${preparedDate}`] : []),
    "Status: Ready for Review",
    "",
    `View Quotation: ${quotationUrl}`,
    "",
    "Please keep this email for your records.",
  ].join("\n");

  return {
    subject: `Your TCL Quotation Is Ready — ${quotationReference}`,
    html,
    text,
    recipient: customerEmail,
  };
}
