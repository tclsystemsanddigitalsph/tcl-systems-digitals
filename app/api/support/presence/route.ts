import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("support_presence")
      .select("status, updated_at")
      .eq("id", "tcl_support")
      .maybeSingle();

    if (error) {
      console.error("[TCL support presence] Unable to load status:", error);
      return NextResponse.json(
        {
          status: "AWAY",
          updatedAt: null,
        },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        },
      );
    }

    return NextResponse.json(
      {
        status: data?.status === "ONLINE" ? "ONLINE" : "AWAY",
        updatedAt: data?.updated_at ?? null,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("[TCL support presence] Unexpected error:", error);

    return NextResponse.json(
      {
        status: "AWAY",
        updatedAt: null,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
