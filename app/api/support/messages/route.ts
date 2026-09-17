import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type MessagesBody = {
  customerToken?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MessagesBody;
    const customerToken = body.customerToken?.trim();

    if (!customerToken) {
      return NextResponse.json(
        { error: "Support session is required." },
        { status: 400 },
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data: conversation, error: conversationError } =
      await supabase
        .from("support_conversations")
        .select("id,support_reference,status")
        .eq("customer_token", customerToken)
        .maybeSingle();

    if (conversationError) {
      console.error("Unable to load support conversation:", conversationError);

      return NextResponse.json(
        { error: "Unable to load support conversation." },
        { status: 500 },
      );
    }

    if (!conversation) {
      return NextResponse.json(
        { error: "Support conversation not found." },
        { status: 404 },
      );
    }

    const { data: messages, error: messagesError } = await supabase
      .from("support_messages")
      .select("id,sender,message,created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Unable to load support messages:", messagesError);

      return NextResponse.json(
        { error: "Unable to load support messages." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      supportReference: conversation.support_reference,
      status: conversation.status,
      messages: messages ?? [],
    });
  } catch (error) {
    console.error("Support messages API error:", error);

    return NextResponse.json(
      { error: "Unable to load support messages." },
      { status: 500 },
    );
  }
}
