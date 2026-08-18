import { getAnalyticsSummary } from "@/features/analytics";
import { DashboardStatCard } from "@/components/admin";
import { requireStaff } from "@/lib/auth/guards";

function rand(cents: number) {
  return `R ${(cents / 100).toFixed(0)}`;
}

export default async function AnalyticsAdminPage() {
  await requireStaff();
  let summary = {
    days: 30,
    fromDate: "",
    toDate: "",
    appointments: 0,
    completed: 0,
    cancelled: 0,
    noShows: 0,
    cashCollectedCents: 0,
    invoicedCents: 0,
    outstandingCents: 0,
    newPatients: 0,
  };
  try {
    summary = await getAnalyticsSummary(30);
  } catch {
    // Supabase may be unconfigured locally
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Last {summary.days} days
          {summary.fromDate ? ` · ${summary.fromDate} to ${summary.toDate}` : ""}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard label="Cash collected" value={rand(summary.cashCollectedCents)} />
        <DashboardStatCard label="Invoiced" value={rand(summary.invoicedCents)} />
        <DashboardStatCard label="Outstanding (current)" value={rand(summary.outstandingCents)} />
        <DashboardStatCard label="Appointments" value={String(summary.appointments)} />
        <DashboardStatCard label="Completed" value={String(summary.completed)} />
        <DashboardStatCard label="Cancelled" value={String(summary.cancelled)} />
        <DashboardStatCard label="No-shows" value={String(summary.noShows)} />
        <DashboardStatCard label="New patients" value={String(summary.newPatients)} />
      </div>
      <p className="text-sm text-muted-foreground">
        Cash collected is payments received in this period. Invoiced is invoices issued in this
        period. Outstanding is unpaid invoice balance right now — not profit. Mark attendance
        Complete or No-show on the calendar so completed and no-show counts stay true.
      </p>
    </div>
  );
}
