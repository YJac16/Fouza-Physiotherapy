import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import {
  getCurrentMonthFinanceSummary,
  getTodayAppointmentCount,
} from "@/features/analytics/api/finance";

/**
 * Read a single practice_settings value by key. Public — used on marketing
 * pages to resolve branding/contact overrides, so no auth guard here.
 */
export async function getPracticeSetting(key: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("practice_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value ?? null;
}

/**
 * Upsert a single practice_settings value. Caller is responsible for
 * authorization (admin-only) — see actions/settings.ts.
 */
export async function setPracticeSetting(key: string, value: unknown) {
  const supabase = await createClient();
  return supabase.from("practice_settings").upsert({
    key,
    value: value as never,
    updated_at: new Date().toISOString(),
  });
}

/**
 * Aggregate counts for the admin dashboard. Staff only.
 */
export async function getDashboardMetrics() {
  await requireStaff();
  const supabase = await createClient();

  const [patients, todayAppointments, notes, monthFinance] = await Promise.all([
    supabase.from("patients").select("id", { count: "exact", head: true }),
    getTodayAppointmentCount(),
    supabase.from("clinical_notes").select("id", { count: "exact", head: true }),
    getCurrentMonthFinanceSummary(),
  ]);

  return {
    patientCount: patients.count ?? 0,
    todayAppointments,
    cashCollectedCents: monthFinance.cashCollectedCents,
    outstandingCents: monthFinance.outstandingCents,
    invoicedCents: monthFinance.invoicedCents,
    notesCount: notes.count ?? 0,
    monthFrom: monthFinance.fromDate,
    monthTo: monthFinance.toDate,
  };
}
