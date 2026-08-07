import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

export const REQUIRED_CONSENT_SLUGS = [
  "treatment-consent",
  "account-responsibility",
] as const;

export const INTAKE_SLUG = "fouza-consent-intake";

export type ConsentCompletion = {
  intakeComplete: boolean;
  consentsComplete: boolean;
  complete: boolean;
  missing: string[];
};

export async function getPatientConsentCompletion(
  patientId: string,
): Promise<ConsentCompletion> {
  const supabase = await createClient();

  const { data: patientFlags } = await supabase
    .from("patients")
    .select("informed_consent_signed")
    .eq("id", patientId)
    .maybeSingle();
  if (patientFlags?.informed_consent_signed) {
    return {
      intakeComplete: true,
      consentsComplete: true,
      complete: true,
      missing: [],
    };
  }

  const [{ data: intakeForm }, { data: consentForms }] = await Promise.all([
    supabase
      .from("intake_forms")
      .select("id")
      .eq("slug", INTAKE_SLUG)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("consent_forms")
      .select("id, slug, title")
      .in("slug", [...REQUIRED_CONSENT_SLUGS])
      .eq("is_active", true),
  ]);

  const missing: string[] = [];

  let intakeComplete = false;
  if (intakeForm?.id) {
    const { data: intake } = await supabase
      .from("intake_responses")
      .select("id")
      .eq("patient_id", patientId)
      .eq("form_id", intakeForm.id)
      .limit(1)
      .maybeSingle();
    intakeComplete = Boolean(intake);
    if (!intakeComplete) missing.push("Fouza Physiotherapy Consent Form (intake)");
  }

  const forms = consentForms ?? [];
  let consentsComplete = forms.length > 0;
  for (const form of forms) {
    const { data: sig } = await supabase
      .from("consent_signatures")
      .select("id")
      .eq("patient_id", patientId)
      .eq("form_id", form.id)
      .limit(1)
      .maybeSingle();
    if (!sig) {
      consentsComplete = false;
      missing.push(form.title);
    }
  }

  return {
    intakeComplete,
    consentsComplete,
    complete: intakeComplete && consentsComplete,
    missing,
  };
}

/** Staff/service-role variant for admin pages. */
export async function getPatientConsentCompletionAdmin(
  patientId: string,
): Promise<ConsentCompletion> {
  const admin = createServiceClient();

  const { data: patientFlags } = await admin
    .from("patients")
    .select("informed_consent_signed")
    .eq("id", patientId)
    .maybeSingle();
  if (patientFlags?.informed_consent_signed) {
    return {
      intakeComplete: true,
      consentsComplete: true,
      complete: true,
      missing: [],
    };
  }

  const [{ data: intakeForm }, { data: consentForms }] = await Promise.all([
    admin
      .from("intake_forms")
      .select("id")
      .eq("slug", INTAKE_SLUG)
      .eq("is_active", true)
      .maybeSingle(),
    admin
      .from("consent_forms")
      .select("id, slug, title")
      .in("slug", [...REQUIRED_CONSENT_SLUGS])
      .eq("is_active", true),
  ]);

  const missing: string[] = [];

  let intakeComplete = false;
  if (intakeForm?.id) {
    const { data: intake } = await admin
      .from("intake_responses")
      .select("id")
      .eq("patient_id", patientId)
      .eq("form_id", intakeForm.id)
      .limit(1)
      .maybeSingle();
    intakeComplete = Boolean(intake);
    if (!intakeComplete) missing.push("Fouza Physiotherapy Consent Form (intake)");
  }

  const forms = consentForms ?? [];
  let consentsComplete = forms.length > 0;
  for (const form of forms) {
    const { data: sig } = await admin
      .from("consent_signatures")
      .select("id")
      .eq("patient_id", patientId)
      .eq("form_id", form.id)
      .limit(1)
      .maybeSingle();
    if (!sig) {
      consentsComplete = false;
      missing.push(form.title);
    }
  }

  return {
    intakeComplete,
    consentsComplete,
    complete: intakeComplete && consentsComplete,
    missing,
  };
}
