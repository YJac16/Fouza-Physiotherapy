import Link from "next/link";

import { EmptyState } from "@/components/shared/states";
import { ConsentStatusCard } from "@/components/patient/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listConsentForms } from "@/features/consent-forms/actions/consent";
import { getPatientConsentCompletionAdmin } from "@/features/consent-forms/lib/completion";
import { routes } from "@/config/routes";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

function formatSignedParts(iso: string | null | undefined) {
  if (!iso) return { date: "—", time: "—" };
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-ZA", { timeZone: "Africa/Johannesburg" }),
    time: d.toLocaleTimeString("en-ZA", {
      timeZone: "Africa/Johannesburg",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export default async function ConsentFormsAdminPage() {
  await requireStaff();
  const supabase = await createClient();

  const [{ data: forms }, { data: signatures }, { data: intakeResponses }, { data: patients }] =
    await Promise.all([
      listConsentForms(),
      supabase
        .from("consent_signatures")
        .select("id, form_id, patient_id, signed_at")
        .order("signed_at", { ascending: false })
        .limit(30),
      supabase
        .from("intake_responses")
        .select("id, form_id, patient_id, submitted_at, answers")
        .order("submitted_at", { ascending: false })
        .limit(20),
      supabase
        .from("patients")
        .select(
          "id, first_name, last_name, email, verified_account, informed_consent_signed, informed_consent_signed_at, informed_consent_version",
        )
        .order("updated_at", { ascending: false })
        .limit(40),
    ]);

  const patientIds = (patients ?? []).map((p) => p.id);
  const { data: appointmentCounts } = patientIds.length
    ? await supabase.from("appointments").select("id, patient_id, starts_at, status").in("patient_id", patientIds)
    : { data: [] as Array<{ id: string; patient_id: string; starts_at: string; status: string }> };

  const bookingsByPatient = new Map<string, number>();
  for (const appt of appointmentCounts ?? []) {
    bookingsByPatient.set(appt.patient_id, (bookingsByPatient.get(appt.patient_id) ?? 0) + 1);
  }

  const patientStatus = await Promise.all(
    (patients ?? []).map(async (p) => {
      const completion = await getPatientConsentCompletionAdmin(p.id);
      return { ...p, completion, bookingCount: bookingsByPatient.get(p.id) ?? 0 };
    }),
  );

  return (
    <div className="min-w-0 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Informed consent</h1>
        <p className="text-sm text-muted-foreground">
          Pre-visit intake and consent status across patients.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Patient checklist</h2>
        {!patientStatus.length ? (
          <EmptyState
            title="No patients yet"
            description="Patient consent status will appear after bookings."
          />
        ) : (
          <div className="grid gap-3">
            {patientStatus.map((p) => {
              const signed = formatSignedParts(p.informed_consent_signed_at);
              const complete = p.informed_consent_signed || p.completion.complete;
              return (
                <Card key={p.id} className="min-w-0 overflow-hidden">
                  <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium [overflow-wrap:anywhere]">
                        {p.first_name} {p.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
                        {p.email ?? "—"}
                      </p>
                      <dl className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                        <div>
                          <dt className="inline font-medium text-foreground">Date signed: </dt>
                          <dd className="inline">{signed.date}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-foreground">Time signed: </dt>
                          <dd className="inline">{signed.time}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="inline font-medium text-foreground">Consent version: </dt>
                          <dd className="inline [overflow-wrap:anywhere]">
                            {p.informed_consent_version ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-foreground">Bookings: </dt>
                          <dd className="inline">{p.bookingCount}</dd>
                        </div>
                      </dl>
                      {!complete && p.completion.missing.length ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Missing: {p.completion.missing.join(", ")}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={p.verified_account ? "success" : "secondary"}>
                        {p.verified_account ? "Verified" : "Unverified"}
                      </Badge>
                      <Badge variant={complete ? "success" : "warning"}>
                        {complete ? "Consent complete" : "Consent pending"}
                      </Badge>
                      <Button asChild variant="outline" size="sm">
                        <Link href={routes.admin.patient(p.id)}>Booking history</Link>
                      </Button>
                      {complete ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={routes.admin.consentFormPatient(p.id)}>View signed</Link>
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Active forms</h2>
        {!forms?.length ? (
          <EmptyState
            title="No consent forms"
            description="Publish consent forms to collect patient signatures."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {forms.map((form) => {
              const signed = signatures?.filter((s) => s.form_id === form.id).length ?? 0;
              return (
                <ConsentStatusCard
                  key={form.id}
                  formName={form.title}
                  status={signed > 0 ? "signed" : "pending"}
                  signedDate={
                    signed > 0 ? `${signed} signature${signed === 1 ? "" : "s"}` : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Recent intake submissions</h2>
        {!intakeResponses?.length ? (
          <EmptyState
            title="No intake submissions"
            description="Patient intake forms will appear here once submitted."
          />
        ) : (
          <div className="grid gap-3">
            {intakeResponses.map((response) => {
              const answers = (response.answers ?? {}) as Record<string, unknown>;
              return (
                <Card key={response.id} className="min-w-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base [overflow-wrap:anywhere]">
                      Intake · {new Date(response.submitted_at).toLocaleString("en-ZA")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {typeof answers.fullName === "string" ? (
                      <p>Name: {answers.fullName}</p>
                    ) : null}
                    {typeof answers.medicalAid === "string" ? (
                      <p>Medical aid: {answers.medicalAid}</p>
                    ) : null}
                    {typeof answers.undertaking === "string" ? (
                      <p>Undertaking: {answers.undertaking}</p>
                    ) : null}
                    <Button asChild variant="link" className="h-auto p-0 text-sm">
                      <Link href={routes.admin.consentFormPatient(response.patient_id)}>
                        View signed package
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
