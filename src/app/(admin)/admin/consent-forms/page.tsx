import { EmptyState } from "@/components/shared/states";
import { ConsentStatusCard } from "@/components/patient/cards";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listConsentForms } from "@/features/consent-forms/actions/consent";
import { getPatientConsentCompletionAdmin } from "@/features/consent-forms/lib/completion";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

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
        .select("id, first_name, last_name, email")
        .order("updated_at", { ascending: false })
        .limit(40),
    ]);

  const patientStatus = await Promise.all(
    (patients ?? []).map(async (p) => {
      const completion = await getPatientConsentCompletionAdmin(p.id);
      return { ...p, completion };
    }),
  );

  return (
    <div className="space-y-8">
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
            {patientStatus.map((p) => (
              <Card key={p.id}>
                <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">
                      {p.first_name} {p.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{p.email}</p>
                    {!p.completion.complete && p.completion.missing.length ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Missing: {p.completion.missing.join(", ")}
                      </p>
                    ) : null}
                  </div>
                  <Badge variant={p.completion.complete ? "success" : "warning"}>
                    {p.completion.complete ? "Complete" : "Pending"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
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
                <Card key={response.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Intake · {new Date(response.submitted_at).toLocaleString("en-ZA")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm text-muted-foreground">
                    <p>Patient ID: {response.patient_id}</p>
                    {typeof answers.fullName === "string" ? (
                      <p>Name: {answers.fullName}</p>
                    ) : null}
                    {typeof answers.medicalAid === "string" ? (
                      <p>Medical aid: {answers.medicalAid}</p>
                    ) : null}
                    {typeof answers.undertaking === "string" ? (
                      <p>Undertaking: {answers.undertaking}</p>
                    ) : null}
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
