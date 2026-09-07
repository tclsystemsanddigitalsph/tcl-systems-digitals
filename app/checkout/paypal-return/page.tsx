import { redirect } from "next/navigation";
import { capturePayPalOrder } from "@/lib/paypal";

export const dynamic = "force-dynamic";

export default async function PayPalReturnPage({
  searchParams,
}: {
  searchParams: Promise<{
    token?: string | string[];
    product?: string | string[];
    PayerID?: string | string[];
  }>;
}) {
  const params = await searchParams;

  const orderId =
    typeof params.token === "string"
      ? params.token.trim()
      : "";

  const productSlug =
    typeof params.product === "string"
      ? params.product.trim()
      : "";

  if (!orderId) {
    const checkoutUrl = new URLSearchParams();

    if (productSlug) {
      checkoutUrl.set("product", productSlug);
    }

    checkoutUrl.set("payment_error", "1");

    redirect(`/checkout?${checkoutUrl.toString()}`);
  }

  let completed = false;

  try {
    const capturedOrder = await capturePayPalOrder(orderId);
    completed = capturedOrder.status === "COMPLETED";
  } catch (error) {
    console.error("PayPal capture failed:", error);
  }

  // Keep redirect() OUTSIDE the try/catch.
  // Next.js implements redirect by throwing internally.
  if (!completed) {
    const checkoutUrl = new URLSearchParams();

    if (productSlug) {
      checkoutUrl.set("product", productSlug);
    }

    checkoutUrl.set("payment_error", "1");

    redirect(`/checkout?${checkoutUrl.toString()}`);
  }

  const successUrl = new URLSearchParams({
    order: orderId,
  });

  if (productSlug) {
    successUrl.set("product", productSlug);
  }

  redirect(`/checkout/success?${successUrl.toString()}`);
}
