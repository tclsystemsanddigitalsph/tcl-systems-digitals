import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type RequestBody = {
  customerToken?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const customerToken = body.customerToken?.trim();

    if (!customerToken) {
      return NextResponse.json(
        { error: "Customer token is required." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data: conversation, error: conversationError } =
      await supabase
        .from("support_conversations")
        .select(
          "id, support_reference, status, tcl_typing_until, closed_at",
        )
        .eq("customer_token", customerToken)
        .maybeSingle();

    if (conversationError) {
      console.error(
        "[TCL support messages] Conversation lookup failed:",
        conversationError,
      );

      return NextResponse.json(
        { error: "Unable to load the support conversation." },
        { status: 500 },
      );
    }

    // This also handles a conversation that has already been removed by
    // the 7-day retention cleanup. The widget can clear its old session
    // and offer the customer a fresh conversation.
    if (!conversation) {
      return NextResponse.json(
        {
          conversationExists: false,
          supportReference: null,
          status: "EXPIRED",
          presence: "AWAY",
          isTyping: false,
          closedAt: null,
          messages: [],
        },
        {
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        },
      );
    }

    const { data: messages, error: messagesError } = await supabase
      .from("support_messages")
      .select("id, sender, message, created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error(
        "[TCL support messages] Message lookup failed:",
        messagesError,
      );

      return NextResponse.json(
        { error: "Unable to load support messages." },
        { status: 500 },
      );
    }

    const { data: presenceData, error: presenceError } =
      await supabase
        .from("support_presence")
        .select("status")
        .eq("id", "tcl_support")
        .maybeSingle();

    if (presenceError) {
      console.error(
        "[TCL support messages] Presence lookup failed:",
        presenceError,
      );
    }

    const status =
      typeof conversation.status === "string"
        ? conversation.status
        : "OPEN";

    const isClosed = status === "CLOSED";

    const typingUntil = conversation.tcl_typing_until
      ? new Date(conversation.tcl_typing_until).getTime()
      : 0;

    const isTyping =
      !isClosed &&
      Number.isFinite(typingUntil) &&
      typingUntil > Date.now();

    return NextResponse.json(
      {
        conversationExists: true,
        supportReference: conversation.support_reference,
        status,
        presence:
          presenceData?.status === "ONLINE" ? "ONLINE" : "AWAY",
        isTyping,
        closedAt: conversation.closed_at ?? null,
        messages: messages ?? [],
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("[TCL support messages] Unexpected error:", error);

    return NextResponse.json(
      { error: "Unable to load support messages." },
      { status: 500 },
    );
  }
}
