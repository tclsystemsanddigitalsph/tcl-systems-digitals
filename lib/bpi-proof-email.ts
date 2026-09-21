import { tclEmailShell } from "@/lib/tcl-email-template";

type BpiProofEmailInput = {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  productName: string;
  amount: number;
  currency?: string;
  referenceNumber?: string | null;
  submittedDate: string;
  statusUrl: string;
  selectedDesignName?: string | null;
};

function money(amount: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function buildBpiProofReceivedEmail({
  customerName,
  customerEmail,
  orderNumber,
  productName,
  amount,
  currency = "PHP",
  referenceNumber,
  submittedDate,
  statusUrl,
  selectedDesignName,
}: BpiProofEmailInput) {
  const firstName =
    customerName.trim().split(/\s+/)[0] || customerName || "there";

  const html = tclEmailShell({
    eyebrow: "PAYMENT PROOF RECEIVED",
    title: "We've received your payment proof.",
    message: `Hi ${firstName}, your BPI proof of payment was submitted successfully. Your payment is now waiting for manual verification by TCL Systems & Digitals PH.`,
    details: [
      { label: "Order Number", value: orderNumber },
      { label: "Product / Package", value: productName },
      ...(selectedDesignName
        ? [{ label: "Selected Design", value: selectedDesignName }]
        : []),
      { label: "Payment Method", value: "Direct BPI Bank Transfer" },
      { label: "Amount", value: money(amount, currency) },
      ...(referenceNumber
        ? [{ label: "Reference Number", value: referenceNumber }]
        : []),
      { label: "Proof Submitted", value: submittedDate },
      { label: "Payment Status", value: "Pending Verification" },
    ],
    buttonLabel: "Check Order Status",
    buttonUrl: statusUrl,
    note: "IMPORTANT: Submission of proof does not mean the payment is confirmed yet. Please wait for TCL to verify the transfer. Once verified, you will receive a separate payment confirmation email. You do not need to submit another proof while this one is pending.",
  });

  const text = [
    "TCL Systems & Digitals PH",
    "",
    "Payment Proof Received",
    `Hi ${firstName}, your BPI proof of payment was submitted successfully.`,
    "",
    `Order Number: ${orderNumber}`,
    `Customer: ${customerName || customerEmail}`,
    `Product / Package: ${productName}`,
    ...(selectedDesignName ? [`Selected Design: ${selectedDesignName}`] : []),
    "Payment Method: Direct BPI Bank Transfer",
    `Amount: ${money(amount, currency)}`,
    ...(referenceNumber ? [`Reference Number: ${referenceNumber}`] : []),
    `Proof Submitted: ${submittedDate}`,
    "Payment Status: Pending Verification",
    "",
    "Important: Your payment is not confirmed yet. TCL will manually verify your transfer. Once verified, you will receive a separate payment confirmation email.",
    "",
    `Check Order Status: ${statusUrl}`,
    "",
    "If you need help, reply to this email.",
  ].join("\n");

  return {
    subject: `Payment Proof Received — ${orderNumber}`,
    html,
    text,
  };
}

export function buildTclBpiProofNotification({
  customerName,
  customerEmail,
  orderNumber,
  productName,
  amount,
  currency = "PHP",
  referenceNumber,
  submittedDate,
  statusUrl,
  selectedDesignName,
}: BpiProofEmailInput) {
  const html = tclEmailShell({
    eyebrow: "BPI PROOF / TCL ADMIN",
    title: "Payment proof submitted.",
    message:
      "A customer has submitted BPI proof of payment. The payment is still pending until it is reviewed and verified in Admin.",
    details: [
      { label: "Order Number", value: orderNumber },
      { label: "Customer", value: customerName || customerEmail },
      { label: "Email", value: customerEmail || "—" },
      { label: "Product / Package", value: productName },
      ...(selectedDesignName
        ? [{ label: "Selected Design", value: selectedDesignName }]
        : []),
      { label: "Amount", value: money(amount, currency) },
      ...(referenceNumber
        ? [{ label: "Reference Number", value: referenceNumber }]
        : []),
      { label: "Submitted", value: submittedDate },
      { label: "Status", value: "Pending Verification" },
    ],
    note: "Review the uploaded proof in Admin before marking this payment as completed.",
  });

  const text = [
    "TCL Systems & Digitals PH — BPI Proof Submitted",
    "",
    `Order Number: ${orderNumber}`,
    `Customer: ${customerName || customerEmail}`,
    `Email: ${customerEmail || "—"}`,
    `Product / Package: ${productName}`,
    ...(selectedDesignName ? [`Selected Design: ${selectedDesignName}`] : []),
    `Amount: ${money(amount, currency)}`,
    ...(referenceNumber ? [`Reference Number: ${referenceNumber}`] : []),
    `Submitted: ${submittedDate}`,
    "Status: Pending Verification",
    "",
    "Review the proof in Admin before marking the payment as completed.",
    `Customer status page: ${statusUrl}`,
  ].join("\n");

  return {
    subject: `BPI Proof Submitted — ${orderNumber}`,
    html,
    text,
  };
}
