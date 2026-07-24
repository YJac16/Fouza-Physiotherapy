import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { AppRole } from "@/types/auth";
import type { Profile } from "@/types/auth";

const STAFF_ROLES: AppRole[] = ["admin", "practitioner", "receptionist"];

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getSessionProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data;
}

export async function requireUser(redirectTo = "/login") {
  const profile = await getSessionProfile();
  if (!profile) {
    redirect(`${redirectTo}?redirectTo=/portal`);
  }
  return profile;
}

export async function requireStaff(redirectTo = "/login") {
  const profile = await requireUser(redirectTo);
  if (!STAFF_ROLES.includes(profile.role)) {
    redirect("/portal");
  }
  return profile;
}

export async function requireRole(roles: AppRole[], redirectTo = "/login") {
  const profile = await requireUser(redirectTo);
  if (!roles.includes(profile.role)) {
    redirect(STAFF_ROLES.includes(profile.role) ? "/admin" : "/portal");
  }
  return profile;
}

export async function requireAdmin() {
  return requireRole(["admin"]);
}

export function isStaffRole(role: AppRole) {
  return STAFF_ROLES.includes(role);
}
