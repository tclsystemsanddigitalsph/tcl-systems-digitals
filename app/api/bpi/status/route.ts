import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = String(
      request.nextUrl.searchParams.get("token") ?? "",
    ).trim();

    if (!token) {
      return NextResponse.json(
        { error: "Missing BPI order token." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id,order_number,receipt_token,total_amount,payment_provider,payment_status",
      )
      .eq("receipt_token", token)
      .maybeSingle();

    if (orderError) {
      console.error("Regular BPI status order error:", orderError);
      return NextResponse.json(
        { error: "Unable to check BPI payment status." },
        { status: 500 },
      );
    }

    if (!order || String(order.payment_provider ?? "").toUpperCase() !== "BPI") {
      return NextResponse.json(
        { error: "BPI order not found." },
        { status: 404 },
      );
    }

    const { data: proof, error: proofError } = await supabase
      .from("bank_transfer_proofs")
      .select("status,submitted_at,verified_at")
      .eq("order_id", order.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (proofError) {
      console.error("Regular BPI status proof error:", proofError);
      return NextResponse.json(
        { error: "Unable to check proof status." },
        { status: 500 },
      );
    }

    const paymentStatus = String(order.payment_status ?? "").toUpperCase();
    const proofStatus = String(proof?.status ?? "").toUpperCase();

    let status: "PENDING" | "VERIFIED" | "REJECTED" = "PENDING";

    if (
      paymentStatus === "COMPLETED" ||
      paymentStatus === "PAID" ||
      proofStatus === "VERIFIED" ||
      proofStatus === "APPROVED"
    ) {
      status = "VERIFIED";
    } else if (
      proofStatus === "REJECTED" ||
      proofStatus === "DECLINED"
    ) {
      status = "REJECTED";
    }

    return NextResponse.json(
      {
        ok: true,
        orderNumber: String(order.order_number ?? ""),
        amount: Number(order.total_amount ?? 0),
        status,
        proofSubmitted: Boolean(proof),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Regular BPI status error:", error);
    return NextResponse.json(
      { error: "Unable to check BPI payment status." },
      { status: 500 },
    );
  }
}
