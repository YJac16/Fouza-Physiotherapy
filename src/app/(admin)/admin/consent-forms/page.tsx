import { EmptyState } from "@/components/shared/states";
import { ConsentStatusCard } from "@/components/patient/cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listConsentForms } from "@/features/consent-forms/actions/consent";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function ConsentFormsAdminPage() {
  await requireStaff();
  const supabase = await createClient();

  const [{ data: forms }, { data: signatures }, { data: intakeResponses }] = await Promise.all([
    listConsentForms(),
    supabase.from("consent_signatures").select("id, form_id, patient_id, signed_at").limit(20),
    supabase.from("intake_responses").select("id, form_id, patient_id, submitted_at").limit(20),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Consent forms</h1>
        <p className="text-sm text-muted-foreground">
          Intake and consent status across active forms.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Active forms</h2>
        {!forms?.length ? (
          <EmptyState
            title="No consent forms"
            description="Create consent forms to collect patient signatures."
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
        <h2 className="font-display text-lg font-semibold">Intake responses</h2>
        {!intakeResponses?.length ? (
          <EmptyState
            title="No intake submissions"
            description="Patient intake forms will appear here once submitted."
          />
        ) : (
          <div className="grid gap-3">
            {intakeResponses.map((response) => (
              <Card key={response.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Intake · {new Date(response.submitted_at).toLocaleString("en-ZA")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Patient ID: {response.patient_id}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
