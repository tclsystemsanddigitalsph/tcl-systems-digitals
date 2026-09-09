import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import {
  completeCustomOrderPayment,
  getCustomCheckoutState,
} from "@/lib/custom-order-payments";
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

function toCentavos(value: number) {
  return Math.round(Number(value) * 100);
}

function checkoutUrl(
  origin: string,
  receipt: string,
  key: string,
  value: string,
) {
  const url = new URL(
    `/checkout/custom/${encodeURIComponent(receipt)}`,
    origin,
  );
  url.searchParams.set(key, value);
  return url;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const paypalOrderId = url.searchParams.get("token")?.trim() ?? "";
  const receipt = url.searchParams.get("receipt")?.trim() ?? "";

  if (!paypalOrderId || !receipt) {
    return NextResponse.redirect(
      checkoutUrl(url.origin, receipt, "payment_error", "1"),
    );
  }

  const supabase = createAdminSupabaseClient();

  try {
    const checkout = await getCustomCheckoutState(receipt);

    if (!checkout) {
      return NextResponse.redirect(
        checkoutUrl(url.origin, receipt, "payment_error", "1"),
      );
    }

    const { data: payment, error: paymentError } = await supabase
      .from("order_payments")
      .select(
        "id,order_id,payment_stage,amount,currency,status,paypal_order_id,paypal_capture_id",
      )
      .eq("paypal_order_id", paypalOrderId)
      .eq("order_id", checkout.order.id)
      .maybeSingle();

    if (paymentError || !payment) {
      throw paymentError ?? new Error("Local payment record not found.");
    }

    if (payment.status === "COMPLETED") {
      return NextResponse.redirect(
        checkoutUrl(url.origin, receipt, "payment_success", "1"),
      );
    }

    const capturedOrder =
      (await capturePayPalOrder(paypalOrderId)) as CapturedPayPalOrder;

    if (capturedOrder.status !== "COMPLETED") {
      return NextResponse.redirect(
        checkoutUrl(url.origin, receipt, "payment_error", "1"),
      );
    }

    const purchaseUnit = capturedOrder.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const capturedPaymentId = purchaseUnit?.custom_id?.trim() ?? "";

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
      capturedPaymentId !== payment.id ||
      !Number.isFinite(paidNumber) ||
      paidCurrency.toUpperCase() !== String(payment.currency).toUpperCase() ||
      toCentavos(paidNumber) !== toCentavos(Number(payment.amount))
    ) {
      console.error("Custom PayPal payment validation failed.", {
        paypalOrderId,
        capturedPaymentId,
        localPaymentId: payment.id,
        paidCurrency,
        expectedCurrency: payment.currency,
        paidValue,
        expectedAmount: payment.amount,
      });

      return NextResponse.redirect(
        checkoutUrl(url.origin, receipt, "payment_error", "1"),
      );
    }

    await completeCustomOrderPayment({
      paymentId: payment.id,
      provider: "PAYPAL",
      paypalCaptureId: capture?.id ?? null,
    });

    return NextResponse.redirect(
      checkoutUrl(url.origin, receipt, "payment_success", "1"),
    );
  } catch (error) {
    console.error("Custom PayPal capture failed:", error);

    return NextResponse.redirect(
      checkoutUrl(url.origin, receipt, "payment_error", "1"),
    );
  }
}
