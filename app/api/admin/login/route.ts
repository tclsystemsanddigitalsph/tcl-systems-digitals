import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Relative redirects preserve the address used by the browser.
  function back(code: string) {
    return new NextResponse(null, {
      status: 303,
      headers: {
        Location: `/admin/login?error=${code}`,
        "Cache-Control": "no-store",
      },
    });
  }

  try {
    const origin = request.headers.get("origin");
    if (!origin || new URL(origin).host !== request.headers.get("host")) {
      return back("origin");
    }

    const form = await request.formData();
    const email = form.get("email");
    const password = form.get("password");
    if (typeof email !== "string" || typeof password !== "string" ||
        !email.trim() || !password) return back("missing");

    const response = new NextResponse(null, {
      status: 303,
      headers: { Location: "/admin", "Cache-Control": "no-store" },
    });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(), password,
    });
    if (error || !data.session) {
      return back(error?.code === "invalid_credentials" ? "credentials" : "auth");
    }
    return response;
  } catch {
    return back("connection");
  }
}
