"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff, requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

const signSchema = z.object({
  formId: z.string().uuid(),
  patientId: z.string().uuid(),
  signatureData: z.string().min(10),
});

const intakeSchema = z.object({
  formId: z.string().uuid(),
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
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
  });
  if (!parsed.success) return { error: "Invalid signature payload" };

  const supabase = await createClient();
  const { error } = await supabase.from("consent_signatures").insert({
    form_id: parsed.data.formId,
    patient_id: parsed.data.patientId,
    signature_data: parsed.data.signatureData,
  });
  if (error) return { error: error.message };
  revalidatePath("/portal/forms");
  return { success: "Consent recorded" };
}

export async function submitIntakeAction(
  _prev: ConsentActionState,
  formData: FormData,
): Promise<ConsentActionState> {
  await requireUser();
  const parsed = intakeSchema.safeParse({
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
