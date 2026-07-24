import { getAnalyticsSummary } from "@/features/analytics";
import { ChartsPlaceholder, DashboardStatCard } from "@/components/admin";
import { requireStaff } from "@/lib/auth/guards";

export default async function AnalyticsAdminPage() {
  await requireStaff();
  let summary = {
    days: 30,
    appointments: 0,
    completed: 0,
    utilization: 0,
    revenueCents: 0,
    newPatients: 0,
    noShows: 0,
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
        <p className="text-sm text-muted-foreground">Last {summary.days} days</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard label="Appointments" value={String(summary.appointments)} />
        <DashboardStatCard label="Utilization" value={`${summary.utilization}%`} />
        <DashboardStatCard
          label="Revenue"
          value={`R ${(summary.revenueCents / 100).toFixed(0)}`}
          trend="up"
        />
        <DashboardStatCard label="New patients" value={String(summary.newPatients)} />
      </div>
      <ChartsPlaceholder title="Appointments over time" height="h-64" />
    </div>
  );
}
