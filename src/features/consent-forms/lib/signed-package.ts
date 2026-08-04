import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { INTAKE_SLUG, REQUIRED_CONSENT_SLUGS } from "./completion";
import type { SignedConsentPackage, SignedConsentSignature } from "./signed-package-types";

export type {
  SignedConsentPackage,
  SignedConsentSignature,
} from "./signed-package-types";
export { INTAKE_ANSWER_LABELS } from "./signed-package-types";

function parseSignatureData(raw: string): { typedName: string | null; padDataUrl: string | null } {
  try {
    const parsed = JSON.parse(raw) as { typedName?: string; pad?: string };
    if (parsed && typeof parsed === "object") {
      return {
        typedName: typeof parsed.typedName === "string" ? parsed.typedName : null,
        padDataUrl: typeof parsed.pad === "string" ? parsed.pad : null,
      };
    }
  } catch {
    // legacy plain data URL
  }
  if (raw.startsWith("data:image")) {
    return { typedName: null, padDataUrl: raw };
  }
  return { typedName: raw || null, padDataUrl: null };
}

async function loadSignedPackageWithClient(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  patientId: string,
): Promise<SignedConsentPackage | null> {
  const { data: patient } = await client
    .from("patients")
    .select("id, first_name, last_name")
    .eq("id", patientId)
    .maybeSingle();

  if (!patient) return null;

  const [{ data: intakeForm }, { data: consentForms }] = await Promise.all([
    client
      .from("intake_forms")
      .select("id, title")
      .eq("slug", INTAKE_SLUG)
      .eq("is_active", true)
      .maybeSingle(),
    client
      .from("consent_forms")
      .select("id, title, slug, body_md")
      .in("slug", [...REQUIRED_CONSENT_SLUGS])
      .eq("is_active", true),
  ]);

  let intake: SignedConsentPackage["intake"] = null;
  if (intakeForm?.id) {
    const { data: response } = await client
      .from("intake_responses")
      .select("answers, submitted_at")
      .eq("patient_id", patientId)
      .eq("form_id", intakeForm.id)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (response) {
      intake = {
        formTitle: intakeForm.title,
        submittedAt: response.submitted_at,
        answers: (response.answers ?? {}) as Record<string, unknown>,
      };
    }
  }

  const signatures: SignedConsentSignature[] = [];
  for (const form of consentForms ?? []) {
    const { data: sig } = await client
      .from("consent_signatures")
      .select("signature_data, signed_at")
      .eq("patient_id", patientId)
      .eq("form_id", form.id)
      .order("signed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sig) continue;
    const parsed = parseSignatureData(sig.signature_data ?? "");
    signatures.push({
      formId: form.id,
      formTitle: form.title,
      formSlug: form.slug,
      formBody: form.body_md ?? "",
      signedAt: sig.signed_at,
      typedName: parsed.typedName,
      padDataUrl: parsed.padDataUrl,
    });
  }

  return {
    patientId: patient.id,
    patientName: `${patient.first_name} ${patient.last_name}`.trim(),
    intake,
    signatures,
  };
}

export async function getSignedConsentPackage(
  patientId: string,
): Promise<SignedConsentPackage | null> {
  const supabase = await createClient();
  return loadSignedPackageWithClient(supabase, patientId);
}

export async function getSignedConsentPackageAdmin(
  patientId: string,
): Promise<SignedConsentPackage | null> {
  const admin = createServiceClient();
  return loadSignedPackageWithClient(admin, patientId);
}
