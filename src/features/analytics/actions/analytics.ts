"use server";

import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export async function getAnalyticsSummary(days = 30) {
  await requireStaff();
  const supabase = await createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const [appointments, payments, patients, noShows] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, status, starts_at")
      .gte("starts_at", since),
    supabase.from("payments").select("amount_cents, paid_at").gte("paid_at", since),
    supabase.from("patients").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "no_show")
      .gte("starts_at", since),
  ]);

  const completed =
    appointments.data?.filter((a) => a.status === "completed").length ?? 0;
  const revenue = (payments.data ?? []).reduce((s, p) => s + p.amount_cents, 0);
  const totalAppts = appointments.data?.length ?? 0;

  return {
    days,
    appointments: totalAppts,
    completed,
    utilization: totalAppts ? Math.round((completed / totalAppts) * 100) : 0,
    revenueCents: revenue,
    newPatients: patients.count ?? 0,
    noShows: noShows.count ?? 0,
  };
}
