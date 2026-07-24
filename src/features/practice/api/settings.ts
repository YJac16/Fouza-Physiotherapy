import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

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
  const today = new Date().toISOString().slice(0, 10);

  const [patients, appointments, invoices, notes] = await Promise.all([
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .gte("starts_at", `${today}T00:00:00Z`),
    supabase
      .from("invoices")
      .select("total_cents")
      .eq("status", "paid"),
    supabase.from("clinical_notes").select("id", { count: "exact", head: true }),
  ]);

  const revenue = (invoices.data ?? []).reduce((s, i) => s + (i.total_cents ?? 0), 0);

  return {
    patientCount: patients.count ?? 0,
    todayAppointments: appointments.count ?? 0,
    revenueCents: revenue,
    notesCount: notes.count ?? 0,
  };
}
