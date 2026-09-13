import { tclEmailShell } from "@/lib/tcl-email-template";

type RegularOrderReceiptEmailInput = {
  customerName?: string | null;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  productName: string;
  paymentMethod: string;
  paymentReference?: string | null;
  subtotal: number;
  processingFee: number;
  totalPaid: number;
  currency?: string;
  orderStatus?: string | null;
  statusUrl: string;
  accessUrl?: string | null;
  accessReady?: boolean;
};

function money(amount: number, currency = "PHP") {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function buildRegularOrderReceiptEmail({
  customerName,
  customerEmail,
  orderNumber,
  orderDate,
  productName,
  paymentMethod,
  paymentReference,
  subtotal,
  processingFee,
  totalPaid,
  currency = "PHP",
  orderStatus,
  statusUrl,
  accessUrl,
  accessReady = false,
}: RegularOrderReceiptEmailInput) {
  const firstName = customerName?.trim()
    ? customerName.trim().split(/\s+/)[0]
    : null;

  const buttonUrl =
    accessReady && accessUrl?.trim() ? accessUrl.trim() : statusUrl;

  const buttonLabel =
    accessReady && accessUrl?.trim()
      ? "Access Your Purchase"
      : "Check Order Status";

  const html = tclEmailShell({
    eyebrow: "ORDER CONFIRMATION",
    title: "Payment Confirmed ✓",
    message: firstName
      ? `Hi ${firstName}, your payment has been received and your TCL order is confirmed.`
      : "Your payment has been received and your TCL order is confirmed.",
    details: [
      { label: "Order Number", value: orderNumber },
      { label: "Order Date", value: orderDate },
      { label: "Customer", value: customerName?.trim() || customerEmail },
      { label: "Product", value: productName },
      { label: "Payment Method", value: paymentMethod },
      ...(paymentReference?.trim()
        ? [{ label: "Payment Reference", value: paymentReference.trim() }]
        : []),
      { label: "Subtotal", value: money(subtotal, currency) },
      { label: "Processing Fee", value: money(processingFee, currency) },
      { label: "Total Paid", value: money(totalPaid, currency) },
      ...(orderStatus?.trim()
        ? [{ label: "Order Status", value: orderStatus.trim() }]
        : []),
    ],
    buttonLabel,
    buttonUrl,
    note: accessReady
      ? "Your purchase is ready. You can use the button above to access your order. You can also use your order status page anytime for the latest order information."
      : "Your payment is confirmed. Use the button above anytime to check the latest status of your order.",
  });

  const textLines = [
    "TCL Systems & Digitals PH",
    "",
    "Payment Confirmed",
    firstName
      ? `Hi ${firstName}, your payment has been received and your TCL order is confirmed.`
      : "Your payment has been received and your TCL order is confirmed.",
    "",
    `Order Number: ${orderNumber}`,
    `Order Date: ${orderDate}`,
    `Customer: ${customerName?.trim() || customerEmail}`,
    `Product: ${productName}`,
    `Payment Method: ${paymentMethod}`,
    ...(paymentReference?.trim()
      ? [`Payment Reference: ${paymentReference.trim()}`]
      : []),
    `Subtotal: ${money(subtotal, currency)}`,
    `Processing Fee: ${money(processingFee, currency)}`,
    `Total Paid: ${money(totalPaid, currency)}`,
    ...(orderStatus?.trim() ? [`Order Status: ${orderStatus.trim()}`] : []),
    "",
    `${buttonLabel}: ${buttonUrl}`,
    "",
    "Please keep this email for your records.",
  ];

  return {
    subject: `Payment Confirmed — ${orderNumber}`,
    html,
    text: textLines.join("\n"),
  };
}
