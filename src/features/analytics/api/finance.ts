"use server";

import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { endOfSastDayExclusive, startOfSastDay, toDateKey } from "@/features/booking/lib/timezone";
import {
  countsAsTodayAppointment,
  currentSastMonthRange,
  invoiceOutstandingCents,
  invoicePaidCents,
  invoicedCents,
  lastNSastDaysRange,
  sastDateRangeIso,
} from "@/features/analytics/lib/finance";

export type PracticeFinanceSummary = {
  fromDate: string;
  toDate: string;
  cashCollectedCents: number;
  invoicedCents: number;
  outstandingCents: number;
};

export async function getPracticeFinanceSummary(input: {
  fromDate: string;
  toDate: string;
}): Promise<PracticeFinanceSummary> {
  await requireStaff();
  const supabase = await createClient();
  const { fromIso, toExclusiveIso } = sastDateRangeIso(input.fromDate, input.toDate);

  const { data, error } = await supabase.rpc("practice_finance_snapshot", {
    p_paid_from: fromIso,
    p_paid_to_exclusive: toExclusiveIso,
    p_issue_from: input.fromDate,
    p_issue_to: input.toDate,
  });

  if (error) {
    return getPracticeFinanceSummaryFromTables(supabase, input, fromIso, toExclusiveIso);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    fromDate: input.fromDate,
    toDate: input.toDate,
    cashCollectedCents: Number(row?.cash_collected_cents ?? 0),
    invoicedCents: Number(row?.invoiced_cents ?? 0),
    outstandingCents: Number(row?.outstanding_cents ?? 0),
  };
}

async function getPracticeFinanceSummaryFromTables(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: { fromDate: string; toDate: string },
  fromIso: string,
  toExclusiveIso: string,
): Promise<PracticeFinanceSummary> {
  const [{ data: payments, error: paymentsError }, { data: invoices, error: invoicesError }] =
    await Promise.all([
      supabase
        .from("payments")
        .select("amount_cents")
        .gte("paid_at", fromIso)
        .lt("paid_at", toExclusiveIso),
      supabase
        .from("invoices")
        .select("id, status, total_cents, issue_date, payments(amount_cents)"),
    ]);

  if (paymentsError) throw new Error(paymentsError.message);
  if (invoicesError) throw new Error(invoicesError.message);

  const rows = invoices ?? [];
  return {
    fromDate: input.fromDate,
    toDate: input.toDate,
    cashCollectedCents: (payments ?? []).reduce((sum, payment) => sum + payment.amount_cents, 0),
    invoicedCents: invoicedCents(
      rows.filter(
        (invoice) => invoice.issue_date >= input.fromDate && invoice.issue_date <= input.toDate,
      ),
    ),
    outstandingCents: rows
      .filter((invoice) => invoice.status !== "void")
      .reduce(
        (sum, invoice) =>
          sum +
          invoiceOutstandingCents(invoice.total_cents, invoicePaidCents(invoice.payments ?? [])),
        0,
      ),
  };
}

export async function getCurrentMonthFinanceSummary() {
  const range = currentSastMonthRange();
  return getPracticeFinanceSummary({ fromDate: range.fromDate, toDate: range.toDate });
}

export async function getLastNDaysFinanceSummary(days = 30) {
  const range = lastNSastDaysRange(days);
  return getPracticeFinanceSummary({ fromDate: range.fromDate, toDate: range.toDate });
}

export async function getTodayAppointmentCount(now = new Date()) {
  await requireStaff();
  const supabase = await createClient();
  const today = toDateKey(now);
  const startIso = startOfSastDay(today).toISOString();
  const endExclusiveIso = endOfSastDayExclusive(today).toISOString();

  const { data, error } = await supabase
    .from("appointments")
    .select("id, status")
    .gte("starts_at", startIso)
    .lt("starts_at", endExclusiveIso);

  if (error) throw new Error(error.message);
  return (data ?? []).filter((row) => countsAsTodayAppointment(row.status)).length;
}
