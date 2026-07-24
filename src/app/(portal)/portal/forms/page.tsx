import { EmptyState } from "@/components/shared/states";
import { listConsentForms } from "@/features/consent-forms/actions/consent";
import { getMyPatientRecord } from "@/features/patients/api/patients";
import { createClient } from "@/lib/supabase/server";
import { PortalFormsClient } from "./portal-forms-client";

export default async function PortalFormsPage() {
  const { data: patient } = await getMyPatientRecord();
  const { data: consentForms } = await listConsentForms();

  const supabase = await createClient();
  const { data: intakeForms } = await supabase
    .from("intake_forms")
    .select("id, title")
    .eq("is_active", true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Forms</h1>
        <p className="text-sm text-muted-foreground">
          Complete intake and consent forms before your visit.
        </p>
      </div>

      {!patient ? (
        <EmptyState
          title="No patient record linked"
          description="Contact the practice to link your account before completing forms."
        />
      ) : !consentForms?.length && !intakeForms?.length ? (
        <EmptyState
          title="No forms available"
          description="There are no active intake or consent forms at this time."
        />
      ) : (
        <PortalFormsClient
          patientId={patient.id}
          consentForms={consentForms ?? []}
          intakeForms={intakeForms ?? []}
        />
      )}
    </div>
  );
}
