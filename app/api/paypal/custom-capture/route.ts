import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { capturePayPalOrder } from "@/lib/paypal";

export const dynamic = "force-dynamic";

type PayPalCapturePayload = {
  status?: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        amount?: {
          currency_code?: string;
          value?: string;
        };
      }>;
    };
  }>;
};

function captureDetails(payload: unknown) {
  const data = payload as PayPalCapturePayload;
  const capture =
    data.purchase_units?.[0]?.payments?.captures?.[0] ?? null;

  return {
    captureId: capture?.id ?? null,
    status: capture?.status ?? data.status ?? null,
    currency: capture?.amount?.currency_code ?? null,
    amount: Number(capture?.amount?.value ?? Number.NaN),
  };
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;
  const receipt = requestUrl.searchParams.get("receipt")?.trim() ?? "";
  const paypalOrderId = requestUrl.searchParams.get("token")?.trim() ?? "";

  if (!receipt || !paypalOrderId) {
    return NextResponse.redirect(
      new URL(`/checkout/custom/${receipt || "invalid"}?error=1`, origin),
      303,
    );
  }

  try {
    const supabase = createAdminSupabaseClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "id,total_amount,currency,payment_status,order_status,paypal_order_id,receipt_token",
      )
      .eq("receipt_token", receipt)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?error=1`, origin),
        303,
      );
    }

    if (order.payment_status === "COMPLETED") {
      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?paid=1`, origin),
        303,
      );
    }

    if (order.order_status === "CANCELLED") {
      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?cancelled_order=1`, origin),
        303,
      );
    }

    if (order.payment_status !== "PENDING") {
      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?error=1`, origin),
        303,
      );
    }

    if (!order.paypal_order_id || order.paypal_order_id !== paypalOrderId) {
      console.error("Custom checkout PayPal order mismatch.");
      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?error=1`, origin),
        303,
      );
    }

    const captured = await capturePayPalOrder(paypalOrderId);
    const details = captureDetails(captured);

    const expectedAmount = Number(order.total_amount ?? 0);
    const expectedCurrency = order.currency || "PHP";

    if (
      details.status !== "COMPLETED" ||
      !details.captureId ||
      !Number.isFinite(details.amount) ||
      Math.abs(details.amount - expectedAmount) > 0.001 ||
      details.currency !== expectedCurrency
    ) {
      console.error("Custom PayPal capture verification failed:", {
        expectedAmount,
        expectedCurrency,
        details,
      });

      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?error=1`, origin),
        303,
      );
    }

    const now = new Date().toISOString();

    const { data: completedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        payment_provider: "PAYPAL",
        payment_status: "COMPLETED",
        paypal_capture_id: details.captureId,
        paid_at: now,
        updated_at: now,
      })
      .eq("id", order.id)
      .eq("payment_status", "PENDING")
      .select("id")
      .maybeSingle();

    if (updateError || !completedOrder) {
      console.error(
        "Unable to complete custom order after PayPal capture:",
        updateError,
      );

      return NextResponse.redirect(
        new URL(`/checkout/custom/${receipt}?error=1`, origin),
        303,
      );
    }

    return NextResponse.redirect(
      new URL(`/checkout/custom/${receipt}?paid=1`, origin),
      303,
    );
  } catch (error) {
    console.error("Custom PayPal capture failed:", error);

    return NextResponse.redirect(
      new URL(`/checkout/custom/${receipt}?error=1`, origin),
      303,
    );
  }
}
