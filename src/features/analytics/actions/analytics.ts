"use server";

import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getLastNDaysFinanceSummary } from "@/features/analytics/api/finance";
import { lastNSastDaysRange } from "@/features/analytics/lib/finance";

export async function getAnalyticsSummary(days = 30) {
  await requireStaff();
  const supabase = await createClient();
  const range = lastNSastDaysRange(days);

  const [appointments, patients, finance] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, status, starts_at")
      .gte("starts_at", range.fromIso)
      .lt("starts_at", range.toExclusiveIso),
    supabase
      .from("patients")
      .select("id", { count: "exact", head: true })
      .gte("created_at", range.fromIso)
      .lt("created_at", range.toExclusiveIso),
    getLastNDaysFinanceSummary(days),
  ]);

  const rows = appointments.data ?? [];
  const completed = rows.filter((a) => a.status === "completed").length;
  const cancelled = rows.filter((a) => a.status === "cancelled").length;
  const noShows = rows.filter((a) => a.status === "no_show").length;

  return {
    days,
    fromDate: range.fromDate,
    toDate: range.toDate,
    appointments: rows.length,
    completed,
    cancelled,
    noShows,
    cashCollectedCents: finance.cashCollectedCents,
    invoicedCents: finance.invoicedCents,
    outstandingCents: finance.outstandingCents,
    newPatients: patients.count ?? 0,
  };
}
