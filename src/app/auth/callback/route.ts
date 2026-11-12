import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin;
  const redirectUrl = new URL("/", siteUrl);

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(new URL("/login?error=confirmation_failed", siteUrl));
}
