import Link from "next/link";

import { EmptyState } from "@/components/shared/states";
import { AppointmentHistoryCard } from "@/components/patient/cards";
import { Button } from "@/components/ui/button";
import { getMyPatientRecord, listMyAppointments } from "@/features/patients/api/patients";
import { getPatientConsentCompletion } from "@/features/consent-forms/lib/completion";
import { requireUser } from "@/lib/auth/guards";
import { routes } from "@/config/routes";

export default async function PortalHomePage() {
  const profile = await requireUser();
  const { data: patient } = await getMyPatientRecord();
  const { data: appointments } = await listMyAppointments(true);

  const greeting = profile.full_name?.split(" ")[0] ?? "there";
  const completion = patient
    ? await getPatientConsentCompletion(patient.id)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Welcome, {greeting}</h1>
        <p className="text-sm text-muted-foreground">
          Your Fouza Physiotherapy patient portal.
        </p>
      </div>

      {patient && completion && !completion.complete ? (
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
          <p className="font-display text-lg font-semibold text-foreground">
            Complete your forms before your visit
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Informed consent is still outstanding
            {completion.missing.length
              ? `: ${completion.missing.join(", ")}`
              : "."}
          </p>
          <Button asChild className="mt-4">
            <Link href={routes.portal.forms}>Open informed consent</Link>
          </Button>
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Upcoming appointments</h2>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.portal.appointments}>View all</Link>
          </Button>
        </div>

        {!patient ? (
          <EmptyState
            title="No patient record linked"
            description="Contact the practice to link your account to a patient record."
          />
        ) : !appointments?.length ? (
          <EmptyState
            title="No upcoming appointments"
            description="Book online or call the practice to schedule your next visit."
            action={
              <Button asChild>
                <Link href={routes.booking.root}>Book appointment</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {appointments.slice(0, 4).map((appt) => {
              const service = (Array.isArray(appt.services)
                ? appt.services[0]
                : appt.services) as { name: string } | null | undefined;
              return (
                <AppointmentHistoryCard
                  key={appt.id}
                  title={service?.name ?? "Appointment"}
                  date={new Date(appt.starts_at).toLocaleString("en-ZA")}
                  practitioner="Fouza Physiotherapy"
                  outcome={appt.status}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
