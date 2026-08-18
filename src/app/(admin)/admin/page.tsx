import Link from "next/link";
import { Calendar, ClipboardList, Receipt, Users } from "lucide-react";

import {
  ActivityFeed,
  AdminAppointmentCard,
  DashboardStatCard,
  type ActivityItem,
} from "@/components/admin/cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/states";
import { AppointmentActions } from "@/features/booking";
import {
  endOfSastDayExclusive,
  startOfSastDay,
  toDateKey,
} from "@/features/booking/lib/timezone";
import { getDashboardMetrics } from "@/features/practice";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

const apptStatusMap: Record<
  string,
  "scheduled" | "in-progress" | "completed" | "no-show" | "cancelled"
> = {
  pending: "scheduled",
  confirmed: "scheduled",
  completed: "completed",
  no_show: "no-show",
  cancelled: "cancelled",
};

export default async function AdminDashboardPage() {
  await requireStaff();
  const metrics = await getDashboardMetrics();
  const supabase = await createClient();
  const today = toDateKey(new Date());
  const dayStart = startOfSastDay(today).toISOString();
  const dayEndExclusive = endOfSastDayExclusive(today).toISOString();

  const [{ data: upcoming }, { data: recentPatients }, { data: recentInvoices }] =
    await Promise.all([
      supabase
        .from("appointments")
        .select(
          "id, starts_at, status, practitioner_id, service_id, patients(first_name, last_name), services(name)",
        )
        .gte("starts_at", dayStart)
        .lt("starts_at", dayEndExclusive)
        .neq("status", "cancelled")
        .order("starts_at", { ascending: true })
        .limit(6),
      supabase
        .from("patients")
        .select("id, first_name, last_name, created_at")
        .order("created_at", { ascending: false })
        .limit(4),
      supabase
        .from("invoices")
        .select("id, invoice_number, status, total_cents, created_at")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

  const activity: ActivityItem[] = [
    ...(recentPatients ?? []).map((p) => ({
      id: `patient-${p.id}`,
      message: `New patient ${p.first_name} ${p.last_name} added`,
      time: new Date(p.created_at).toLocaleString("en-ZA"),
      type: "info" as const,
    })),
    ...(recentInvoices ?? []).map((inv) => ({
      id: `invoice-${inv.id}`,
      message: `Invoice ${inv.invoice_number} · ${inv.status}`,
      time: new Date(inv.created_at).toLocaleString("en-ZA"),
      type: inv.status === "paid" ? ("success" as const) : ("warning" as const),
    })),
  ]
    .sort((a, b) => (a.time < b.time ? 1 : -1))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Daily practice overview.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={routes.admin.appointments}>Appointments</Link>
          </Button>
          <Button asChild>
            <Link href={routes.admin.patients}>Patients</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href={routes.admin.patients}>
          <DashboardStatCard
            label="Patients"
            value={String(metrics.patientCount)}
            icon={<Users className="size-4" />}
          />
        </Link>
        <Link href={routes.admin.appointments}>
          <DashboardStatCard
            label="Today's appointments"
            value={String(metrics.todayAppointments)}
            icon={<Calendar className="size-4" />}
          />
        </Link>
        <Link href={routes.admin.billing}>
          <DashboardStatCard
            label="Cash collected (this month)"
            value={`R ${(metrics.cashCollectedCents / 100).toFixed(0)}`}
            icon={<Receipt className="size-4" />}
          />
        </Link>
        <Link href={routes.admin.billing}>
          <DashboardStatCard
            label="Outstanding"
            value={`R ${(metrics.outstandingCents / 100).toFixed(0)}`}
            icon={<ClipboardList className="size-4" />}
          />
        </Link>
        <Link href={routes.admin.clinicalNotes}>
          <DashboardStatCard
            label="Clinical notes"
            value={String(metrics.notesCount)}
            icon={<ClipboardList className="size-4" />}
          />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Today&apos;s appointments</h2>
            <Button asChild variant="outline" size="sm">
              <Link href={routes.admin.appointments}>View all</Link>
            </Button>
          </div>
          {!upcoming?.length ? (
            <EmptyState
              title="No appointments today"
              description="Bookings for today will appear here."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((appt) => {
                const patient = (Array.isArray(appt.patients)
                  ? appt.patients[0]
                  : appt.patients) as
                  | { first_name?: string; last_name?: string }
                  | null
                  | undefined;
                const service = (Array.isArray(appt.services)
                  ? appt.services[0]
                  : appt.services) as { name?: string } | null | undefined;
                const patientName = patient
                  ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
                  : "Unknown patient";

                return (
                  <AdminAppointmentCard
                    key={appt.id}
                    patientName={patientName || "Unknown patient"}
                    treatment={service?.name ?? "Appointment"}
                    time={new Date(appt.starts_at).toLocaleString("en-ZA", {
                      timeZone: "Africa/Johannesburg",
                    })}
                    status={apptStatusMap[appt.status] ?? "scheduled"}
                    actions={
                      <AppointmentActions
                        appointmentId={appt.id}
                        practitionerId={appt.practitioner_id}
                        serviceId={appt.service_id}
                        currentStatus={appt.status}
                      />
                    }
                  />
                );
              })}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-h5">Cash collected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Daily cash, invoiced, and outstanding totals are on Analytics. Charts come in a
                later phase — these cards are the source of truth for now.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={routes.admin.analytics}>Open analytics</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <ActivityFeed items={activity} emptyMessage="No recent activity yet" />
        </section>
      </div>
    </div>
  );
}
