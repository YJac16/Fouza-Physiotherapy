"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { cookies } from "next/headers";

import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth";
import {
  AUTH_REMEMBER_COOKIE,
  AUTH_REMEMBER_MAX_AGE_SECONDS,
  parseRememberMeFromForm,
} from "@/lib/supabase/auth-cookies";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isStaffRole, requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import type { AppRole } from "@/types/auth";

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid credentials" };
  }

  const rememberMe = parseRememberMeFromForm(formData);
  const cookieStore = await cookies();
  cookieStore.set(AUTH_REMEMBER_COOKIE, rememberMe ? "1" : "0", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: AUTH_REMEMBER_MAX_AGE_SECONDS,
  });

  const supabase = await createClient({ rememberMe });
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .maybeSingle();

  const role = (profile?.role ?? "patient") as AppRole;
  const redirectTo = formData.get("redirectTo")?.toString();
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    redirect(redirectTo);
  }
  redirect(isStaffRole(role) ? "/admin" : "/portal");
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid registration" };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  const redirectTo = formData.get("redirectTo")?.toString();
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return {
      success:
        "Check your email to confirm your account, then sign in to continue your booking.",
    };
  }
  return {
    success: "Check your email to confirm your account, then sign in.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid email" };
  }

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/reset-password`,
  });
  if (error) return { error: error.message };
  return { success: "If an account exists, a reset link has been sent." };
}

export async function resetPasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid password" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: error.message };
  redirect("/login");
}

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  role: z.enum(["admin", "practitioner", "receptionist"]),
});

export async function inviteStaffAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { error: "Invalid invite details" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return { error: "Admin only" };

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const admin = createServiceClient();
  const { error } = await admin.from("staff_invites").insert({
    email: parsed.data.email.toLowerCase(),
    full_name: parsed.data.fullName,
    role: parsed.data.role,
    token,
    invited_by: user.id,
    expires_at: expiresAt,
  });

  if (error) return { error: error.message };
  return { success: `Invite created for ${parsed.data.email}. Share the invite link securely.` };
}

export async function deactivateStaffAccessAction(profileId: string): Promise<AuthActionState> {
  const actor = await requireAdmin();
  if (profileId === actor.id) {
    return { error: "You cannot revoke your own access." };
  }

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("id, role, email, full_name")
    .eq("id", profileId)
    .maybeSingle();
  if (!target) return { error: "User not found" };
  if (!isStaffRole(target.role)) return { error: "This account is not staff" };

  if (target.role === "admin") {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) <= 1) return { error: "Keep at least one admin on the practice." };
  }

  const { error } = await supabase.from("profiles").update({ role: "patient" }).eq("id", profileId);
  if (error) return { error: error.message };

  await supabase.from("practitioners").update({ is_active: false }).eq("profile_id", profileId);
  await supabase.from("audit_logs").insert({
    actor_id: actor.id,
    action: "staff.deactivate",
    entity_type: "profile",
    entity_id: profileId,
    meta: { previousRole: target.role, email: target.email },
  });

  revalidatePath("/admin/users");
  return { success: `${target.full_name ?? target.email} can no longer access admin.` };
}

export async function cancelStaffInviteAction(inviteId: string): Promise<AuthActionState> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: invite } = await supabase
    .from("staff_invites")
    .select("id, email, accepted_at")
    .eq("id", inviteId)
    .maybeSingle();
  if (!invite) return { error: "Invite not found" };
  if (invite.accepted_at) return { error: "This invite has already been used" };

  const { error } = await supabase.from("staff_invites").delete().eq("id", inviteId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: `Invite for ${invite.email} cancelled` };
}
