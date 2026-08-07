import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";
import type { AppRole } from "@/types/auth";

/**
 * Route protection matrix
 * -----------------------
 * /admin/*   → authenticated + role in (admin, practitioner, receptionist)
 * /portal/*  → authenticated + patient or staff
 * Auth pages → redirect to role home if already authenticated
 *
 * Public: marketing, booking, blog, auth callback
 */

const ADMIN_ROLES: AppRole[] = ["admin", "practitioner", "receptionist"];

const protectedAdminPrefix = "/admin";
const protectedPortalPrefix = "/portal";
const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];

function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("your-project") &&
      key !== "your-anon-key",
  );
}

function homeForRole(role: AppRole) {
  if (ADMIN_ROLES.includes(role)) return "/admin";
  return "/portal";
}

export async function middleware(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const { user, supabaseResponse, supabase } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith(protectedAdminPrefix);
  const isPortalRoute = pathname.startsWith(protectedPortalPrefix);
  const isAuthPage = authPages.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!user && (isAdminRoute || isPortalRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const role = (profile?.role ?? "patient") as AppRole;
    const url = request.nextUrl.clone();
    const redirectTo = request.nextUrl.searchParams.get("redirectTo");
    if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
      // Preserve query string on absolute app paths (e.g. /portal/forms?returnTo=...)
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    url.pathname = homeForRole(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && (isAdminRoute || isPortalRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = (profile?.role ?? "patient") as AppRole;

    if (isAdminRoute && !ADMIN_ROLES.includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/portal";
      return NextResponse.redirect(url);
    }

    if (isPortalRoute && role !== "patient" && !ADMIN_ROLES.includes(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
