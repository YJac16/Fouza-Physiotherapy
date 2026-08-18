import Link from "next/link";

import { EmptyState } from "@/components/shared/states";
import { AppointmentHistoryCard } from "@/components/patient/cards";
import { Button } from "@/components/ui/button";
import { getPortalView, listMyAppointments } from "@/features/patients/api/patients";
import { patientDisplayName } from "@/features/patients/lib/access";
import { routes } from "@/config/routes";

export default async function PortalAppointmentsPage() {
  const { selected: patient } = await getPortalView();
  const { data: appointments } = await listMyAppointments(false, patient?.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            {patient
              ? `Visit history for ${patientDisplayName(patient)}.`
              : "Your visit history and upcoming bookings."}
          </p>
        </div>
        <Button asChild>
          <Link href={routes.booking.root}>Book appointment</Link>
        </Button>
      </div>

      {!patient ? (
        <EmptyState
          title="No patient record linked"
          description="Contact the practice to link your account."
        />
      ) : !appointments?.length ? (
        <EmptyState
          title="No appointments yet"
          description="Book the first appointment online."
          action={
            <Button asChild>
              <Link href={routes.booking.root}>Book now</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {appointments.map((appt) => {
            const service = (Array.isArray(appt.services) ? appt.services[0] : appt.services) as
              | { name: string }
              | null
              | undefined;
            return (
              <AppointmentHistoryCard
                key={appt.id}
                title={service?.name ?? "Appointment"}
                date={new Date(appt.starts_at).toLocaleString("en-ZA", {
                  timeZone: "Africa/Johannesburg",
                })}
                practitioner="Fouza Physiotherapy"
                outcome={appt.status}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
