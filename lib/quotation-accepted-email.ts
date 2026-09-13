import { tclEmailShell } from "@/lib/tcl-email-template";

type PaymentChoice = "PROVIDER_FULL" | "PROVIDER_DEPOSIT" | "BPI_FULL";

type QuotationAcceptedEmailInput = {
  customerName?: string | null;
  customerEmail: string;
  orderNumber: string;
  projectName?: string | null;
  businessName?: string | null;
  quotedAmount: number;
  processingFeePercent: number;
  processingFee: number;
  totalAmount: number;
  amountDueNow: number;
  paymentChoice: PaymentChoice;
  checkoutUrl: string;
  acceptedAt: string;
};

function money(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(value));
}

function paymentLabel(choice: PaymentChoice) {
  if (choice === "PROVIDER_DEPOSIT") {
    return "50% Down Payment — Online Provider";
  }
  if (choice === "BPI_FULL") {
    return "Pay in Full — Direct BPI Bank Transfer";
  }
  return "Pay in Full — Online Provider";
}

export function buildQuotationAcceptedCustomerEmail(
  input: QuotationAcceptedEmailInput,
) {
  const firstName = input.customerName?.trim().split(/\s+/)[0] || null;
  const project =
    input.businessName?.trim() ||
    input.projectName?.trim() ||
    "Custom Project";

  const message = firstName
    ? `Hi ${firstName}, your quotation has been accepted successfully. Your selected payment option is now locked for this project.`
    : "Your quotation has been accepted successfully. Your selected payment option is now locked for this project.";

  return {
    recipient: input.customerEmail,
    subject: `Quotation Accepted — ${input.orderNumber}`,
    html: tclEmailShell({
      eyebrow: "QUOTATION ACCEPTED",
      title: "Your Project Is Confirmed",
      message,
      details: [
        { label: "Order Reference", value: input.orderNumber },
        { label: "Project", value: project },
        { label: "Quotation Subtotal", value: money(input.quotedAmount) },
        {
          label: `Processing Fee (${input.processingFeePercent}%)`,
          value: money(input.processingFee),
        },
        { label: "Project Total", value: money(input.totalAmount) },
        { label: "Payment Option", value: paymentLabel(input.paymentChoice) },
        { label: "Amount Due Now", value: money(input.amountDueNow) },
        { label: "Accepted", value: dateTime(input.acceptedAt) },
      ],
      buttonLabel: "Continue to Payment",
      buttonUrl: input.checkoutUrl,
      note:
        input.paymentChoice === "BPI_FULL"
          ? "Continue to your private checkout page for the BPI transfer instructions and proof-of-payment upload."
          : "Continue to your private checkout page whenever you are ready to complete the payment due.",
    }),
    text: [
      "TCL Systems & Digitals PH",
      "",
      "Quotation Accepted",
      message,
      "",
      `Order Reference: ${input.orderNumber}`,
      `Project: ${project}`,
      `Quotation Subtotal: ${money(input.quotedAmount)}`,
      `Processing Fee (${input.processingFeePercent}%): ${money(input.processingFee)}`,
      `Project Total: ${money(input.totalAmount)}`,
      `Payment Option: ${paymentLabel(input.paymentChoice)}`,
      `Amount Due Now: ${money(input.amountDueNow)}`,
      `Accepted: ${dateTime(input.acceptedAt)}`,
      "",
      `Continue to Payment: ${input.checkoutUrl}`,
    ].join("\n"),
  };
}

export function buildQuotationAcceptedAdminEmail(
  input: QuotationAcceptedEmailInput,
  adminEmail: string,
) {
  const project =
    input.businessName?.trim() ||
    input.projectName?.trim() ||
    "Custom Project";

  return {
    recipient: adminEmail,
    subject: `Quotation Accepted — ${input.orderNumber}`,
    html: tclEmailShell({
      eyebrow: "ADMIN ALERT",
      title: "A Client Accepted a Quotation",
      message:
        "A quotation has been accepted and the custom order/payment request has been created.",
      details: [
        { label: "Customer", value: input.customerName || input.customerEmail },
        { label: "Customer Email", value: input.customerEmail },
        { label: "Order Reference", value: input.orderNumber },
        { label: "Project", value: project },
        { label: "Quotation Subtotal", value: money(input.quotedAmount) },
        {
          label: `Processing Fee (${input.processingFeePercent}%)`,
          value: money(input.processingFee),
        },
        { label: "Project Total", value: money(input.totalAmount) },
        { label: "Payment Option", value: paymentLabel(input.paymentChoice) },
        { label: "Amount Due Now", value: money(input.amountDueNow) },
        { label: "Accepted", value: dateTime(input.acceptedAt) },
      ],
      buttonLabel: "Open Customer Checkout",
      buttonUrl: input.checkoutUrl,
      note:
        "Payment has not necessarily been received yet. This notification confirms quotation acceptance only.",
    }),
    text: [
      "TCL Systems & Digitals PH — Admin Alert",
      "",
      "A client accepted a quotation.",
      `Customer: ${input.customerName || input.customerEmail}`,
      `Customer Email: ${input.customerEmail}`,
      `Order Reference: ${input.orderNumber}`,
      `Project: ${project}`,
      `Quotation Subtotal: ${money(input.quotedAmount)}`,
      `Processing Fee (${input.processingFeePercent}%): ${money(input.processingFee)}`,
      `Project Total: ${money(input.totalAmount)}`,
      `Payment Option: ${paymentLabel(input.paymentChoice)}`,
      `Amount Due Now: ${money(input.amountDueNow)}`,
      `Accepted: ${dateTime(input.acceptedAt)}`,
      "",
      `Checkout: ${input.checkoutUrl}`,
    ].join("\n"),
  };
}
