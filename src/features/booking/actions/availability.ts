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
  await requireStaff();
  const parsed = ruleSchema.safeParse({
    practitionerId: formData.get("practitionerId"),
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    slotMinutes: formData.get("slotMinutes") || 60,
  });
  if (!parsed.success) return { error: "Invalid availability rule" };

  const supabase = await createClient();
  const { error } = await supabase.from("availability_rules").insert({
    practitioner_id: parsed.data.practitionerId,
    day_of_week: parsed.data.dayOfWeek,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
    slot_minutes: parsed.data.slotMinutes,
  });

  if (error) return { error: error.message };

  revalidatePath(routes.admin.availability);
  return { success: "Availability rule added" };
}
