import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { sendTclEmail } from "@/lib/resend";
import { buildRegularOrderReceiptEmail } from "@/lib/order-confirmation-email";

export const dynamic = "force-dynamic";

type PayPalCapture = {
  id?: string;
  status?: string;
  amount?: {
    currency_code?: string;
    value?: string;
  };
};

type PayPalPurchaseUnit = {
  custom_id?: string;
  amount?: {
    currency_code?: string;
    value?: string;
  };
  payments?: {
    captures?: PayPalCapture[];
  };
};

type CapturedPayPalOrder = {
  id?: string;
  status?: string;
  purchase_units?: PayPalPurchaseUnit[];
};

type LocalOrder = {
  id: string;
  order_number: string;
  product_id: string | null;
  product_name: string;
  customer_name: string | null;
  customer_email: string | null;
  base_price: number;
  processing_fee: number;
  total_amount: number;
  currency: string;
  payment_status: string;
  order_status: string;
  receipt_token: string;
};

function toCentavos(value: number) {
  return Math.round(Number(value) * 100);
}

function checkoutErrorUrl(
  origin: string,
  productSlug: string,
) {
  const failedUrl = new URL("/checkout", origin);

  if (productSlug) {
    failedUrl.searchParams.set("product", productSlug);
  }

  failedUrl.searchParams.set("payment_error", "1");

  return failedUrl;
}

function successUrl(
  origin: string,
  receiptToken: string,
) {
  const url = new URL("/checkout/success", origin);
  url.searchParams.set("receipt", receiptToken);
  return url;
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const paypalOrderId =
    url.searchParams.get("token")?.trim() ?? "";

  const returnProductSlug =
    url.searchParams.get("product")?.trim() ?? "";

  if (!paypalOrderId) {
    return NextResponse.redirect(
      checkoutErrorUrl(url.origin, returnProductSlug),
    );
  }

  const supabase = createAdminSupabaseClient();

  try {
    const { data: localOrderData, error: localOrderError } =
      await supabase
        .from("orders")
        .select(
          "id,order_number,product_id,product_name,customer_name,customer_email,base_price,processing_fee,total_amount,currency,payment_status,order_status,receipt_token",
        )
        .eq("paypal_order_id", paypalOrderId)
        .maybeSingle();

    if (localOrderError) {
      throw localOrderError;
    }

    if (!localOrderData) {
      console.error(
        "No local order exists for PayPal order:",
        paypalOrderId,
      );

      return NextResponse.redirect(
        checkoutErrorUrl(
          url.origin,
          returnProductSlug,
        ),
      );
    }

    const localOrder = {
      ...localOrderData,
      base_price: Number(localOrderData.base_price ?? 0),
      processing_fee: Number(localOrderData.processing_fee ?? 0),
      total_amount: Number(localOrderData.total_amount),
    } as LocalOrder;

    // Already completed: redirect only. Do not send another receipt.
    if (
      localOrder.payment_status === "COMPLETED" &&
      localOrder.receipt_token
    ) {
      return NextResponse.redirect(
        successUrl(
          url.origin,
          localOrder.receipt_token,
        ),
      );
    }

    const capturedOrder =
      (await capturePayPalOrder(
        paypalOrderId,
      )) as CapturedPayPalOrder;

    if (capturedOrder.status !== "COMPLETED") {
      return NextResponse.redirect(
        checkoutErrorUrl(
          url.origin,
          returnProductSlug,
        ),
      );
    }

    const purchaseUnit =
      capturedOrder.purchase_units?.[0];

    const capture =
      purchaseUnit?.payments?.captures?.[0];

    const capturedSlug =
      purchaseUnit?.custom_id?.trim() ?? "";

    const paidCurrency =
      capture?.amount?.currency_code ??
      purchaseUnit?.amount?.currency_code ??
      "";

    const paidValue =
      capture?.amount?.value ??
      purchaseUnit?.amount?.value ??
      "";

    const paidNumber = Number(paidValue);

    if (
      !Number.isFinite(paidNumber) ||
      paidCurrency !== localOrder.currency ||
      toCentavos(paidNumber) !==
        toCentavos(localOrder.total_amount)
    ) {
      console.error(
        "PayPal captured amount does not match local order.",
        {
          paypalOrderId,
          paidCurrency,
          paidValue,
          expectedCurrency: localOrder.currency,
          expectedAmount: localOrder.total_amount,
        },
      );

      return NextResponse.redirect(
        checkoutErrorUrl(
          url.origin,
          returnProductSlug,
        ),
      );
    }

    if (localOrder.product_id) {
      const { data: product, error: productError } =
        await supabase
          .from("products")
          .select("slug")
          .eq("id", localOrder.product_id)
          .maybeSingle();

      if (productError) {
        throw productError;
      }

      if (
        !product ||
        !capturedSlug ||
        product.slug !== capturedSlug
      ) {
        console.error(
          "PayPal product identifier does not match local order.",
          {
            paypalOrderId,
            capturedSlug,
            localProductSlug: product?.slug ?? null,
          },
        );

        return NextResponse.redirect(
          checkoutErrorUrl(
            url.origin,
            returnProductSlug,
          ),
        );
      }
    }

    const paidAt = new Date().toISOString();

    // Conditional update ensures this request is the one that actually
    // changes the payment from PENDING -> COMPLETED.
    const { data: completedOrder, error: updateError } =
      await supabase
        .from("orders")
        .update({
          payment_status: "COMPLETED",
          paypal_capture_id: capture?.id ?? null,
          paid_at: paidAt,
          updated_at: paidAt,
        })
        .eq("id", localOrder.id)
        .eq("payment_status", "PENDING")
        .select("receipt_token,paid_at,paypal_capture_id")
        .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!completedOrder) {
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("payment_status,receipt_token")
        .eq("id", localOrder.id)
        .maybeSingle();

      if (
        currentOrder?.payment_status === "COMPLETED" &&
        currentOrder.receipt_token
      ) {
        return NextResponse.redirect(
          successUrl(
            url.origin,
            currentOrder.receipt_token,
          ),
        );
      }

      throw new Error("PayPal order could not be completed.");
    }

    // Send the customer receipt only after this request successfully
    // completes the local payment. Email failure must never undo payment.
    try {
      const customerEmail = String(
        localOrder.customer_email ?? "",
      ).trim();

      if (customerEmail) {
        const siteUrl = (
          process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
          "https://www.tclsystemsph.com"
        ).replace(/\/$/, "");

        const statusUrl = `${siteUrl}/order-status`;

        const paymentReference =
          capture?.id ??
          completedOrder.paypal_capture_id ??
          paypalOrderId;

        const receipt = buildRegularOrderReceiptEmail({
          customerName: localOrder.customer_name,
          customerEmail,
          orderNumber: localOrder.order_number,
          orderDate: new Intl.DateTimeFormat("en-PH", {
            dateStyle: "long",
            timeStyle: "short",
            timeZone: "Asia/Manila",
          }).format(new Date(completedOrder.paid_at ?? paidAt)),
          productName:
            localOrder.product_name || "TCL Order",
          paymentMethod: "PayPal",
          paymentReference,
          subtotal: localOrder.base_price,
          processingFee: localOrder.processing_fee,
          totalPaid: localOrder.total_amount,
          currency: localOrder.currency || "PHP",
          orderStatus:
            localOrder.order_status || "PENDING",
          statusUrl,
          accessReady: false,
        });

        const emailResult = await sendTclEmail({
          to: customerEmail,
          subject: receipt.subject,
          html: receipt.html,
          text: receipt.text,
        });

        if (!emailResult.ok) {
          console.error(
            "Regular PayPal order completed but receipt email was not sent:",
            emailResult,
          );
        }
      } else {
        console.error(
          "Regular PayPal order completed without a customer email:",
          localOrder.id,
        );
      }
    } catch (emailError) {
      console.error(
        "Regular PayPal receipt email failed after payment completion:",
        emailError,
      );
    }

    return NextResponse.redirect(
      successUrl(
        url.origin,
        completedOrder.receipt_token,
      ),
    );
  } catch (error) {
    console.error("PayPal capture failed:", error);

    return NextResponse.redirect(
      checkoutErrorUrl(
        url.origin,
        returnProductSlug,
      ),
    );
  }
}
