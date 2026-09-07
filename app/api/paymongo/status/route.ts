import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const receipt =
    url.searchParams.get("receipt")?.trim();

  if (!receipt) {
    return NextResponse.json(
      { error: "Missing receipt." },
      { status: 400 },
    );
  }

  const supabase = createAdminSupabaseClient();

  const {
    data: order,
    error,
  } = await supabase
    .from("orders")
    .select(
      "payment_status,payment_provider",
    )
    .eq("receipt_token", receipt)
    .eq("payment_provider", "PAYMONGO")
    .maybeSingle();

  if (error) {
    console.error(
      "Unable to check PayMongo status:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to check payment status.",
      },
      { status: 500 },
    );
  }

  if (!order) {
    return NextResponse.json(
      { error: "Order not found." },
      { status: 404 },
    );
  }

  if (order.payment_status === "COMPLETED") {
    return NextResponse.json({
      status: "COMPLETED",
      redirectUrl:
        `/checkout/success?receipt=${encodeURIComponent(
          receipt,
        )}`,
    });
  }

  return NextResponse.json({
    status: order.payment_status,
  });
}
