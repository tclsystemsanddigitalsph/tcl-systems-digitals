import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

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
  total_amount: number;
  currency: string;
  payment_status: string;
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
          "id,order_number,product_id,product_name,total_amount,currency,payment_status,receipt_token",
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
      total_amount: Number(localOrderData.total_amount),
    } as LocalOrder;

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

    const { data: completedOrder, error: updateError } =
      await supabase
        .from("orders")
        .update({
          payment_status: "COMPLETED",
          paypal_capture_id: capture?.id ?? null,
          paid_at: new Date().toISOString(),
        })
        .eq("id", localOrder.id)
        .select("receipt_token")
        .single();

    if (updateError) {
      throw updateError;
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
