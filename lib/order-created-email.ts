import { tclEmailShell } from "@/lib/tcl-email-template";

type NewRegularOrderEmailInput = {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  productName: string;
  totalAmount: number;
  currency?: string;
  paymentMethod: string;
  checkoutUrl: string;
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

export function buildRegularOrderReceivedEmail({
  customerName,
  customerEmail,
  orderNumber,
  productName,
  totalAmount,
  currency = "PHP",
  paymentMethod,
  checkoutUrl,
  selectedDesignName,
}: NewRegularOrderEmailInput) {
  const firstName = customerName.trim().split(/\s+/)[0] || customerName;

  const html = tclEmailShell({
    eyebrow: "ORDER RECEIVED",
    title: "Your order is in.",
    message: `Hi ${firstName}, we received your TCL order. Complete the payment step below so we can verify your payment and begin processing your order.`,
    details: [
      { label: "Order Number", value: orderNumber },
      { label: "Product", value: productName },
      ...(selectedDesignName
        ? [{ label: "Selected Design", value: selectedDesignName }]
        : []),
      { label: "Payment Method", value: paymentMethod },
      { label: "Amount Due", value: money(totalAmount, currency) },
      { label: "Payment Status", value: "Awaiting Payment" },
    ],
    buttonLabel: "Continue BPI Payment",
    buttonUrl: checkoutUrl,
    note: "Your order has been recorded, but payment is not yet confirmed. After sending your BPI payment, upload your proof of payment on the checkout page for verification.",
  });

  const text = [
    "TCL Systems & Digitals PH",
    "",
    `Hi ${firstName}, we received your order.`,
    "",
    `Order Number: ${orderNumber}`,
    `Product: ${productName}`,
    ...(selectedDesignName ? [`Selected Design: ${selectedDesignName}`] : []),
    `Payment Method: ${paymentMethod}`,
    `Amount Due: ${money(totalAmount, currency)}`,
    "Payment Status: Awaiting Payment",
    "",
    `Continue BPI Payment: ${checkoutUrl}`,
  ].join("\n");

  return {
    subject: `Order Received — ${orderNumber}`,
    html,
    text,
  };
}

export function buildTclNewOrderNotification({
  customerName,
  customerEmail,
  orderNumber,
  productName,
  totalAmount,
  currency = "PHP",
  paymentMethod,
  checkoutUrl,
  selectedDesignName,
}: NewRegularOrderEmailInput) {
  const html = tclEmailShell({
    eyebrow: "NEW ORDER / TCL ADMIN",
    title: "New order received.",
    message: "A new storefront order has been created and is awaiting payment.",
    details: [
      { label: "Order Number", value: orderNumber },
      { label: "Customer", value: customerName },
      { label: "Email", value: customerEmail },
      { label: "Product", value: productName },
      ...(selectedDesignName
        ? [{ label: "Selected Design", value: selectedDesignName }]
        : []),
      { label: "Payment Method", value: paymentMethod },
      { label: "Amount Due", value: money(totalAmount, currency) },
      { label: "Payment Status", value: "Awaiting Payment" },
    ],
    note: "This notification was generated when the order record and BPI payment request were successfully created.",
  });

  const text = [
    "TCL Systems & Digitals PH — New Order",
    "",
    `Order Number: ${orderNumber}`,
    `Customer: ${customerName}`,
    `Email: ${customerEmail}`,
    `Product: ${productName}`,
    ...(selectedDesignName ? [`Selected Design: ${selectedDesignName}`] : []),
    `Payment Method: ${paymentMethod}`,
    `Amount Due: ${money(totalAmount, currency)}`,
    "Payment Status: Awaiting Payment",
    "",
    `Customer checkout: ${checkoutUrl}`,
  ].join("\n");

  return {
    subject: `New Order — ${orderNumber}`,
    html,
    text,
  };
}
