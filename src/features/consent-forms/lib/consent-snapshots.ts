type ConsentFormRow = {
  id: string;
  slug: string;
  version: number;
  body_md: string | null;
};

export function buildConsentSignatureRows(input: {
  patientId: string;
  forms: ConsentFormRow[];
  signatures: Array<{
    formId: string;
    signatureData: string;
  }>;
  signedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
}) {
  const formById = new Map(input.forms.map((form) => [form.id, form]));

  return input.signatures.map((signature) => {
    const form = formById.get(signature.formId);
    return {
      form_id: signature.formId,
      patient_id: input.patientId,
      signature_data: signature.signatureData,
      signed_at: input.signedAt,
      ip_address: input.ipAddress,
      user_agent: input.userAgent,
      form_version: form?.version ?? null,
      body_md_snapshot: form?.body_md ?? null,
    };
  });
}

import type { createServiceClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof createServiceClient>;

export async function loadActiveConsentForms(admin: AdminClient) {
  const { data } = await admin
    .from("consent_forms")
    .select("id, slug, version, body_md")
    .in("slug", ["treatment-consent", "account-responsibility"])
    .eq("is_active", true);
  return data ?? [];
}
