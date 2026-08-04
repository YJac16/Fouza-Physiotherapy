import { EmptyState } from "@/components/shared/states";
import { listConsentForms } from "@/features/consent-forms/actions/consent";
import {
  getPatientConsentCompletion,
  INTAKE_SLUG,
} from "@/features/consent-forms/lib/completion";
import { getSignedConsentPackage } from "@/features/consent-forms/lib/signed-package";
import { getMyPatientRecord } from "@/features/patients/api/patients";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guards";
import { PortalFormsClient } from "./portal-forms-client";

export default async function PortalFormsPage() {
  const profile = await requireUser();
  const { data: patient } = await getMyPatientRecord();
  const { data: consentForms } = await listConsentForms();

  const supabase = await createClient();
  const { data: intakeForms } = await supabase
    .from("intake_forms")
    .select("id, title, slug")
    .eq("is_active", true);

  const intakeForm =
    intakeForms?.find((f) => f.slug === INTAKE_SLUG) ?? intakeForms?.[0] ?? null;
  const treatmentConsent = consentForms?.find((f) => f.slug === "treatment-consent");
  const accountConsent = consentForms?.find((f) => f.slug === "account-responsibility");

  let alreadyComplete = false;
  let appointmentId: string | null = null;
  let signedPackage = null;
  if (patient) {
    const completion = await getPatientConsentCompletion(patient.id);
    alreadyComplete = completion.complete;
    if (alreadyComplete) {
      signedPackage = await getSignedConsentPackage(patient.id);
    }
    const { data: nextAppt } = await supabase
      .from("appointments")
      .select("id")
      .eq("patient_id", patient.id)
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    appointmentId = nextAppt?.id ?? null;
  }

  const viewingSigned = Boolean(patient && alreadyComplete && signedPackage);

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold leading-snug [overflow-wrap:anywhere]">
          {viewingSigned ? "Signed informed consent" : "Informed consent"}
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {viewingSigned
            ? "Your intake and consent forms are on file for the practice."
            : "Complete intake and consent forms before your visit."}
        </p>
      </div>

      {!patient ? (
        <EmptyState
          title="No patient record linked"
          description="Contact the practice to link your account before completing forms."
        />
      ) : !intakeForm || !treatmentConsent || !accountConsent ? (
        <EmptyState
          title="Consent package unavailable"
          description="The practice has not published the informed consent package yet."
        />
      ) : (
        <PortalFormsClient
          patientId={patient.id}
          appointmentId={appointmentId}
          alreadyComplete={alreadyComplete}
          signedPackage={signedPackage}
          intakeForm={intakeForm}
          treatmentConsent={treatmentConsent}
          accountConsent={accountConsent}
          defaults={{
            fullName: profile.full_name ?? undefined,
            email: profile.email,
            phone: patient.phone ?? undefined,
          }}
        />
      )}
    </div>
  );
}
