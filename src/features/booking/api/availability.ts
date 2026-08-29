import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

import { practitionerDisplayName } from "@/features/booking/lib/practitioner-label";

export type AvailabilityPractitionerOption = { id: string; label: string };

export type AvailabilityRuleRow = {
  id: string;
  practitioner_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  is_active: boolean;
  practitionerLabel: string;
};

export type AvailabilityExceptionRow = {
  id: string;
  practitioner_id: string;
  exception_date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  practitionerLabel: string;
};

function practitionerOption(row: {
  id: string;
  title: string | null;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
}): AvailabilityPractitionerOption {
  return { id: row.id, label: practitionerDisplayName(row) };
}

/**
 * Load availability UI data from a regular server module (not a Server Action).
 * Nested practitioner→profile embeds have crashed this page in production when
 * called through `"use server"` during RSC render; keep the query here and flatten.
 */
export async function loadAvailabilityAdminData(): Promise<{
  rules: AvailabilityRuleRow[];
  exceptions: AvailabilityExceptionRow[];
  practitioners: AvailabilityPractitionerOption[];
  error: string | null;
}> {
  await requireStaff();
  const supabase = await createClient();

  const [rulesResult, practitionersResult, exceptionsResult] = await Promise.all([
    supabase
      .from("availability_rules")
      .select("id, practitioner_id, day_of_week, start_time, end_time, slot_minutes, is_active")
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true }),
    supabase
      .from("practitioners")
      .select("id, title, profiles(full_name)")
      .eq("is_active", true)
      .order("title"),
    supabase
      .from("availability_exceptions")
      .select("id, practitioner_id, exception_date, is_available, start_time, end_time, reason")
      .order("exception_date", { ascending: false }),
  ]);

  const error =
    rulesResult.error?.message ??
    practitionersResult.error?.message ??
    exceptionsResult.error?.message ??
    null;

  const practitioners = (practitionersResult.data ?? []).map(practitionerOption);
  const labels = new Map(practitioners.map((p) => [p.id, p.label]));

  const extraIds = [
    ...(rulesResult.data ?? []).map((row) => row.practitioner_id),
    ...(exceptionsResult.data ?? []).map((row) => row.practitioner_id),
  ].filter((id) => !labels.has(id));

  if (extraIds.length) {
    const uniqueIds = [...new Set(extraIds)];
    const { data: extra } = await supabase
      .from("practitioners")
      .select("id, title, profiles(full_name)")
      .in("id", uniqueIds);
    for (const row of extra ?? []) {
      labels.set(row.id, practitionerDisplayName(row));
    }
  }

  return {
    error,
    practitioners,
    rules: (rulesResult.data ?? []).map((row) => ({
      ...row,
      practitionerLabel: labels.get(row.practitioner_id) ?? "Practitioner",
    })),
    exceptions: (exceptionsResult.data ?? []).map((row) => ({
      ...row,
      practitionerLabel: labels.get(row.practitioner_id) ?? "Practitioner",
    })),
  };
}
