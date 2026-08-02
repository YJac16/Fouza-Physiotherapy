import { EmptyState } from "@/components/shared/states";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentActions } from "@/features/booking";
import { getPatientConsentCompletionAdmin } from "@/features/consent-forms/lib/completion";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function AppointmentsAdminPage() {
  await requireStaff();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      "id, patient_id, practitioner_id, service_id, starts_at, ends_at, status, notes, patients(first_name, last_name), services(name)",
    )
    .gte("starts_at", `${today}T00:00:00.000Z`)
    .neq("status", "cancelled")
    .order("starts_at", { ascending: true })
    .limit(50);

  const withConsent = await Promise.all(
    (appointments ?? []).map(async (appt) => {
      const completion = appt.patient_id
        ? await getPatientConsentCompletionAdmin(appt.patient_id)
        : null;
      return { ...appt, completion };
    }),
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Today&apos;s and upcoming appointments across the practice.
        </p>
      </div>

      {!withConsent.length ? (
        <EmptyState
          title="No upcoming appointments"
          description="Bookings from the online scheduler and admin will appear here."
        />
      ) : (
        <div className="grid gap-4">
          {withConsent.map((appt) => {
            const patient = (Array.isArray(appt.patients)
              ? appt.patients[0]
              : appt.patients) as
              | { first_name: string; last_name: string }
              | null
              | undefined;
            const service = (Array.isArray(appt.services)
              ? appt.services[0]
              : appt.services) as { name: string } | null | undefined;
            const patientName = patient
              ? `${patient.first_name} ${patient.last_name}`
              : "Unknown patient";

            return (
              <Card key={appt.id}>
                <CardHeader className="flex-col items-stretch gap-3 space-y-0 pb-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="truncate text-base">{patientName}</CardTitle>
                    <p className="break-words text-sm text-muted-foreground">
                      {new Date(appt.starts_at).toLocaleString("en-ZA", {
                        timeZone: "Africa/Johannesburg",
                      })}
                      {service ? ` · ${service.name}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:justify-end">
                    <Badge variant="secondary" className="capitalize">
                      {appt.status}
                    </Badge>
                    {appt.completion ? (
                      <Badge variant={appt.completion.complete ? "success" : "warning"}>
                        {appt.completion.complete ? "Consent OK" : "Consent pending"}
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {appt.notes ? (
                    <p className="text-sm text-muted-foreground">{appt.notes}</p>
                  ) : null}
                  {appt.practitioner_id && appt.service_id ? (
                    <AppointmentActions
                      appointmentId={appt.id}
                      practitionerId={appt.practitioner_id}
                      serviceId={appt.service_id}
                    />
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
