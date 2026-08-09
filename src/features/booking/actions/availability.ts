"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

const ruleSchema = z.object({
  practitionerId: z.string().uuid(),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  slotMinutes: z.coerce.number().int().positive().default(60),
});

const exceptionSchema = z.object({
  practitionerId: z.string().uuid(),
  exceptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().max(500).optional().nullable(),
  isAvailable: z.coerce.boolean().default(false),
  startTime: z.string().optional().nullable(),
  endTime: z.string().optional().nullable(),
});

export type AvailabilityActionState = { error?: string; success?: string };

export async function listAvailabilityRules() {
  await requireStaff();
  const supabase = await createClient();
  return supabase
    .from("availability_rules")
    .select("*, practitioners(id, title, profile_id, profiles(full_name))")
    .order("day_of_week")
    .order("start_time");
}

export async function listAvailabilityExceptions() {
  await requireStaff();
  const supabase = await createClient();
  return supabase
    .from("availability_exceptions")
    .select("*, practitioners(id, title, profile_id, profiles(full_name))")
    .order("exception_date", { ascending: false });
}

export async function listPractitioners() {
  await requireStaff();
  const supabase = await createClient();
  return supabase
    .from("practitioners")
    .select("id, title, profile_id, profiles(full_name)")
    .eq("is_active", true)
    .order("title");
}

export async function createAvailabilityRuleAction(
  _prev: AvailabilityActionState,
  formData: FormData,
): Promise<AvailabilityActionState> {
  const profile = await requireStaff();
  const parsed = ruleSchema.safeParse({
    practitionerId: formData.get("practitionerId"),
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    slotMinutes: formData.get("slotMinutes") || 60,
  });
  if (!parsed.success) return { error: "Invalid availability rule" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_rules")
    .insert({
      practitioner_id: parsed.data.practitionerId,
      day_of_week: parsed.data.dayOfWeek,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      slot_minutes: parsed.data.slotMinutes,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "availability.rule.create",
    entity_type: "availability_rule",
    entity_id: data.id,
    meta: parsed.data,
  });

  revalidatePath(routes.admin.availability);
  revalidatePath(routes.admin.appointments);
  return { success: "Availability rule added" };
}

export async function deactivateAvailabilityRuleAction(ruleId: string) {
  const profile = await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("availability_rules")
    .update({ is_active: false })
    .eq("id", ruleId);
  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "availability.rule.deactivate",
    entity_type: "availability_rule",
    entity_id: ruleId,
  });

  revalidatePath(routes.admin.availability);
  revalidatePath(routes.admin.appointments);
  return { error: null };
}

export async function activateAvailabilityRuleAction(ruleId: string) {
  const profile = await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("availability_rules")
    .update({ is_active: true })
    .eq("id", ruleId);
  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "availability.rule.activate",
    entity_type: "availability_rule",
    entity_id: ruleId,
  });

  revalidatePath(routes.admin.availability);
  revalidatePath(routes.admin.appointments);
  return { error: null };
}

export async function deleteAvailabilityRuleAction(ruleId: string) {
  const profile = await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase.from("availability_rules").delete().eq("id", ruleId);
  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "availability.rule.delete",
    entity_type: "availability_rule",
    entity_id: ruleId,
  });

  revalidatePath(routes.admin.availability);
  revalidatePath(routes.admin.appointments);
  return { error: null };
}

export async function createAvailabilityExceptionAction(
  _prev: AvailabilityActionState,
  formData: FormData,
): Promise<AvailabilityActionState> {
  const profile = await requireStaff();
  const parsed = exceptionSchema.safeParse({
    practitionerId: formData.get("practitionerId"),
    exceptionDate: formData.get("exceptionDate"),
    reason: formData.get("reason") || null,
    isAvailable: formData.get("isAvailable") === "true",
    startTime: formData.get("startTime") || null,
    endTime: formData.get("endTime") || null,
  });
  if (!parsed.success) return { error: "Invalid exception" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_exceptions")
    .upsert(
      {
        practitioner_id: parsed.data.practitionerId,
        exception_date: parsed.data.exceptionDate,
        is_available: parsed.data.isAvailable,
        reason: parsed.data.reason,
        start_time: parsed.data.isAvailable ? parsed.data.startTime : null,
        end_time: parsed.data.isAvailable ? parsed.data.endTime : null,
      },
      { onConflict: "practitioner_id,exception_date" },
    )
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "availability.exception.create",
    entity_type: "availability_exception",
    entity_id: data.id,
    meta: {
      date: parsed.data.exceptionDate,
      isAvailable: parsed.data.isAvailable,
      reason: parsed.data.reason,
    },
  });

  revalidatePath(routes.admin.availability);
  revalidatePath(routes.admin.appointments);
  return {
    success: parsed.data.isAvailable
      ? "Custom open hours saved"
      : "Date blocked",
  };
}

export async function deleteAvailabilityExceptionAction(exceptionId: string) {
  const profile = await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("availability_exceptions")
    .delete()
    .eq("id", exceptionId);
  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "availability.exception.delete",
    entity_type: "availability_exception",
    entity_id: exceptionId,
  });

  revalidatePath(routes.admin.availability);
  revalidatePath(routes.admin.appointments);
  return { error: null };
}
