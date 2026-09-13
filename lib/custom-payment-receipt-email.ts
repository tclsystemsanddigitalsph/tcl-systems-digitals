import { tclEmailShell } from "@/lib/tcl-email-template";

export type CustomPaymentReceiptStage = "FULL" | "DEPOSIT" | "FINAL";
export type CustomPaymentReceiptProvider = "PAYPAL" | "PAYMONGO" | "BPI";

type CustomPaymentReceiptEmailInput = {
  customerName?: string | null;
  customerEmail: string;
  orderNumber: string;
  productName?: string | null;
  paymentStage: CustomPaymentReceiptStage;
  provider: CustomPaymentReceiptProvider;
  paymentReference?: string | null;
  subtotal: number;
  processingFeePercent: number;
  processingFee: number;
  amountJustPaid: number;
  cumulativePaid: number;
  remainingBalance: number;
  totalAmount: number;
  paidAt: string;
  checkoutUrl: string;
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

function stageLabel(stage: CustomPaymentReceiptStage) {
  if (stage === "DEPOSIT") return "50% Down Payment";
  if (stage === "FINAL") return "Remaining Balance";
  return "Full Payment";
}

function providerLabel(provider: CustomPaymentReceiptProvider) {
  if (provider === "PAYPAL") return "PayPal";
  if (provider === "PAYMONGO") return "PayMongo — Card / QR Ph";
  return "Direct BPI Bank Transfer";
}

export function buildCustomPaymentReceiptEmail(
  input: CustomPaymentReceiptEmailInput,
) {
  const firstName = input.customerName?.trim().split(/\s+/)[0] || null;
  const fullyPaid = input.remainingBalance <= 0.005;
  const stage = stageLabel(input.paymentStage);
  const project = input.productName?.trim() || "Custom Project";

  const message = firstName
    ? `Hi ${firstName}, we received your ${stage.toLowerCase()} successfully. This email serves as your payment receipt.`
    : `We received your ${stage.toLowerCase()} successfully. This email serves as your payment receipt.`;

  const details = [
    { label: "Order Reference", value: input.orderNumber },
    { label: "Project", value: project },
    { label: "Payment Stage", value: stage },
    { label: "Payment Method", value: providerLabel(input.provider) },
  ];

  if (input.paymentReference?.trim()) {
    details.push({
      label: "Transaction / Reference ID",
      value: input.paymentReference.trim(),
    });
  }

  details.push(
    { label: "Project Subtotal", value: money(input.subtotal) },
    {
      label: `Processing Fee (${input.processingFeePercent}%)`,
      value: money(input.processingFee),
    },
    { label: "Amount Paid This Payment", value: money(input.amountJustPaid) },
    { label: "Total Paid So Far", value: money(input.cumulativePaid) },
    { label: "Remaining Balance", value: money(input.remainingBalance) },
    { label: "Project Total", value: money(input.totalAmount) },
    { label: "Payment Date", value: dateTime(input.paidAt) },
    { label: "Payment Status", value: fullyPaid ? "Fully Paid" : "Payment Received" },
  );

  return {
    recipient: input.customerEmail,
    subject: `${fullyPaid ? "Payment Complete" : "Payment Received"} — ${input.orderNumber}`,
    html: tclEmailShell({
      eyebrow: "PAYMENT RECEIPT",
      title: fullyPaid ? "Your Project Is Fully Paid" : `${stage} Received`,
      message,
      details,
      buttonLabel: fullyPaid ? "View Order Status" : "View Payment Status",
      buttonUrl: input.checkoutUrl,
      note: fullyPaid
        ? "Your payment balance is now ₱0.00. Keep this email for your records."
        : "Your successful payment has been recorded. TCL will activate the remaining balance payment when it is due.",
    }),
    text: [
      "TCL Systems & Digitals PH",
      "PAYMENT RECEIPT",
      "",
      message,
      "",
      ...details.map((row) => `${row.label}: ${row.value}`),
      "",
      `${fullyPaid ? "View Order Status" : "View Payment Status"}: ${input.checkoutUrl}`,
    ].join("\n"),
  };
}
