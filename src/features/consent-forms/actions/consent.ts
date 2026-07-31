"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff, requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

const signSchema = z.object({
  formId: z.string().uuid(),
  patientId: z.string().uuid(),
  signatureData: z.string().min(2),
  typedName: z.string().min(2).optional(),
});

const packageSchema = z.object({
  intakeFormId: z.string().uuid(),
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
  treatmentFormId: z.string().uuid(),
  accountFormId: z.string().uuid(),
  treatmentSignature: z.string().min(2),
  accountSignature: z.string().min(2),
  answersJson: z.string().min(2),
});

export type ConsentActionState = { error?: string; success?: string };

export async function signConsentAction(
  _prev: ConsentActionState,
  formData: FormData,
): Promise<ConsentActionState> {
  await requireUser();
  const parsed = signSchema.safeParse({
    formId: formData.get("formId"),
    patientId: formData.get("patientId"),
    signatureData: formData.get("signatureData"),
    typedName: formData.get("typedName")?.toString(),
  });
  if (!parsed.success) return { error: "Invalid signature payload" };

  const signaturePayload = parsed.data.typedName
    ? JSON.stringify({
        typedName: parsed.data.typedName,
        pad: parsed.data.signatureData,
      })
    : parsed.data.signatureData;

  const supabase = await createClient();
  const { error } = await supabase.from("consent_signatures").insert({
    form_id: parsed.data.formId,
    patient_id: parsed.data.patientId,
    signature_data: signaturePayload,
  });
  if (error) return { error: error.message };
  revalidatePath("/portal/forms");
  revalidatePath("/portal");
  revalidatePath("/admin/consent-forms");
  return { success: "Consent recorded" };
}

export async function submitIntakeAction(
  _prev: ConsentActionState,
  formData: FormData,
): Promise<ConsentActionState> {
  await requireUser();
  const parsed = z
    .object({
      formId: z.string().uuid(),
      patientId: z.string().uuid(),
      appointmentId: z.string().uuid().optional().nullable(),
      answersJson: z.string().min(2),
    })
    .safeParse({
      formId: formData.get("formId"),
      patientId: formData.get("patientId"),
      appointmentId: formData.get("appointmentId") || null,
      answersJson: formData.get("answersJson"),
    });
  if (!parsed.success) return { error: "Invalid intake" };

  let answers: Record<string, unknown> = {};
  try {
    answers = JSON.parse(parsed.data.answersJson) as Record<string, unknown>;
  } catch {
    return { error: "Invalid answers JSON" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("intake_responses").insert({
    form_id: parsed.data.formId,
    patient_id: parsed.data.patientId,
    appointment_id: parsed.data.appointmentId,
    answers,
  });
  if (error) return { error: error.message };
  revalidatePath("/portal/forms");
  return { success: "Intake submitted" };
}

/**
 * Single submit for the full Fouza consent package (intake + both signatures).
 */
export async function submitFouzaConsentPackageAction(
  _prev: ConsentActionState,
  formData: FormData,
): Promise<ConsentActionState> {
  const user = await requireUser();
  const parsed = packageSchema.safeParse({
    intakeFormId: formData.get("intakeFormId"),
    patientId: formData.get("patientId"),
    appointmentId: formData.get("appointmentId") || null,
    treatmentFormId: formData.get("treatmentFormId"),
    accountFormId: formData.get("accountFormId"),
    treatmentSignature: formData.get("treatmentSignature"),
    accountSignature: formData.get("accountSignature"),
    answersJson: formData.get("answersJson"),
  });
  if (!parsed.success) return { error: "Please complete all required fields" };

  let answers: Record<string, unknown>;
  try {
    answers = JSON.parse(parsed.data.answersJson) as Record<string, unknown>;
  } catch {
    return { error: "Invalid form answers" };
  }

  if (answers.undertaking !== "yes") {
    return { error: "You must accept the Undertaking (Yes) to continue." };
  }
  if (answers.pleaseNote !== "agree") {
    return { error: "You must Agree and give consent under Please Note to continue." };
  }

  const typedName = String(answers.typedFullName ?? "").trim();
  if (typedName.length < 2) {
    return { error: "Please type your full name to sign." };
  }

  const supabase = await createClient();

  // Ensure the patient belongs to this user
  const { data: patient } = await supabase
    .from("patients")
    .select("id, profile_id")
    .eq("id", parsed.data.patientId)
    .maybeSingle();
  if (!patient || patient.profile_id !== user.id) {
    return { error: "Patient record not linked to your account" };
  }

  const medicalAid = String(answers.medicalAid ?? "").trim();
  const medicalAidNumber = String(answers.medicalAidNumber ?? "").trim();
  const dependant = String(answers.dependantCode ?? "").trim();
  const idNumber = String(answers.idNumber ?? "").trim();
  const postal = [
    answers.street,
    answers.suburb,
    answers.areaCode,
  ]
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .join(", ");

  await supabase
    .from("patients")
    .update({
      medical_aid_name: medicalAid || null,
      medical_aid_number: medicalAidNumber || null,
      medical_aid_dependant_code: dependant || null,
      id_number: idNumber || null,
      postal_address: postal || null,
      phone: String(answers.contactNumber ?? "").trim() || undefined,
      email: String(answers.email ?? "").trim().toLowerCase() || undefined,
    })
    .eq("id", parsed.data.patientId);

  const { error: intakeError } = await supabase.from("intake_responses").insert({
    form_id: parsed.data.intakeFormId,
    patient_id: parsed.data.patientId,
    appointment_id: parsed.data.appointmentId,
    answers,
  });
  if (intakeError) return { error: intakeError.message };

  const treatmentPayload = JSON.stringify({
    typedName,
    pad: parsed.data.treatmentSignature,
  });
  const accountPayload = JSON.stringify({
    typedName,
    pad: parsed.data.accountSignature,
  });

  const { error: sigError } = await supabase.from("consent_signatures").insert([
    {
      form_id: parsed.data.treatmentFormId,
      patient_id: parsed.data.patientId,
      signature_data: treatmentPayload,
    },
    {
      form_id: parsed.data.accountFormId,
      patient_id: parsed.data.patientId,
      signature_data: accountPayload,
    },
  ]);
  if (sigError) return { error: sigError.message };

  revalidatePath("/portal/forms");
  revalidatePath("/portal");
  revalidatePath("/admin/consent-forms");
  revalidatePath("/admin/patients");
  return { success: "Informed consent submitted. Thank you." };
}

export async function listConsentForms() {
  const supabase = await createClient();
  return supabase.from("consent_forms").select("*").eq("is_active", true);
}

export async function createConsentFormAction(
  _prev: ConsentActionState,
  formData: FormData,
): Promise<ConsentActionState> {
  await requireStaff();
  const title = formData.get("title")?.toString();
  const slug = formData.get("slug")?.toString();
  const bodyMd = formData.get("bodyMd")?.toString();
  if (!title || !slug || !bodyMd) return { error: "Missing fields" };
  const supabase = await createClient();
  const { error } = await supabase.from("consent_forms").insert({
    title,
    slug,
    body_md: bodyMd,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/consent-forms");
  return { success: "Consent form created" };
}
