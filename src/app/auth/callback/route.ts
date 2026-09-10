import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { isSafeAppRedirectPath } from "@/lib/security";

/**
 * Auth callback — exchanges the auth code for a session cookie.
 * Used by magic links / OAuth redirects.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const next = isSafeAppRedirectPath(nextParam) ? nextParam : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
