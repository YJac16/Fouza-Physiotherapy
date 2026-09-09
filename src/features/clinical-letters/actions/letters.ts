"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { siteConfig } from "@/config/site";
import { routes } from "@/config/routes";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { enqueueNotification } from "@/features/notifications/actions/email";
import { drainEmailOutbox } from "@/features/notifications/lib/outbox";
import { resolvePatientInvoiceRecipient } from "@/features/billing/lib/invoice-data";
import { greetingFirstName } from "@/features/billing/lib/invoice-recipient";
import {
  DEFAULT_LETTER_TITLES,
  LETTER_AUTHOR_ROLES,
  letterTypeLabel,
} from "@/features/clinical-letters/types/letter";
import {
  createLetterSchema,
  letterTemplateSchema,
  signLetterSchema,
  updateLetterSchema,
} from "@/features/clinical-letters/schemas/letter";
import {
  ageFromDateOfBirth,
  applyLetterPlaceholders,
  buildLetterPlaceholderValues,
} from "@/features/clinical-letters/lib/placeholders";
import { canEditLetter, canSendLetter, canSignLetter } from "@/features/clinical-letters/lib/status";

export type LetterActionState = { error?: string; success?: string; id?: string };

function emptyToNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function revalidateLetterPaths(patientId?: string, letterId?: string) {
  revalidatePath("/admin/letters");
  revalidatePath("/admin/patients");
  revalidatePath("/portal/documents");
  if (patientId) revalidatePath(`/admin/patients/${patientId}`);
  if (letterId) {
    revalidatePath(`/admin/letters/${letterId}`);
    revalidatePath(`/portal/letters/${letterId}`);
  }
}

export async function createLetterAction(
  _prev: LetterActionState,
  formData: FormData,
): Promise<LetterActionState> {
  const profile = await requireRole([...LETTER_AUTHOR_ROLES]);
  const parsed = createLetterSchema.safeParse({
    patientId: formData.get("patientId"),
    letterType: formData.get("letterType"),
    letterDate: formData.get("letterDate"),
    attendanceDate: formData.get("attendanceDate") || null,
    appointmentId: formData.get("appointmentId") || null,
    recipientName: formData.get("recipientName") || null,
    recipientEmail: formData.get("recipientEmail") || null,
    patientAge: formData.get("patientAge") || null,
    patientSex: formData.get("patientSex") || null,
    presentingComplaint: formData.get("presentingComplaint") || null,
    findings: formData.get("findings") || null,
    recommendations: formData.get("recommendations") || null,
    physiotherapistName: formData.get("physiotherapistName"),
    qualifications: formData.get("qualifications") || null,
    contact: formData.get("contact") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid letter details" };
  }

  const supabase = await createClient();
  const [{ data: patient, error: patientError }, { data: template }] = await Promise.all([
    supabase
      .from("patients")
      .select("id, first_name, last_name, date_of_birth")
      .eq("id", parsed.data.patientId)
      .maybeSingle(),
    supabase
      .from("clinical_letter_templates")
      .select("*")
      .eq("letter_type", parsed.data.letterType)
      .maybeSingle(),
  ]);

  if (patientError || !patient) return { error: patientError?.message ?? "Patient not found" };

  const patientName = `${patient.first_name} ${patient.last_name}`.trim();
  const letterDate = parsed.data.letterDate;
  const attendanceDate = emptyToNull(parsed.data.attendanceDate) ?? letterDate;
  const patientAge =
    emptyToNull(parsed.data.patientAge) ?? ageFromDateOfBirth(patient.date_of_birth, letterDate);
  const practiceName = siteConfig.practiceName;
  const body = applyLetterPlaceholders(
    template?.body ?? "",
    buildLetterPlaceholderValues({
      patientName,
      practiceName,
      letterDate,
      attendanceDate,
      patientAge,
      patientSex: parsed.data.patientSex,
      recipientName: parsed.data.recipientName,
      presentingComplaint: parsed.data.presentingComplaint,
      findings: parsed.data.findings,
      recommendations: parsed.data.recommendations,
    }),
  );

  if (!body.trim()) return { error: "Letter template is empty. Update it in Settings first." };

  const { data, error } = await supabase
    .from("clinical_letters")
    .insert({
      patient_id: parsed.data.patientId,
      appointment_id: emptyToNull(parsed.data.appointmentId),
      letter_type: parsed.data.letterType,
      status: "draft",
      letter_date: letterDate,
      attendance_date: attendanceDate,
      recipient_name: emptyToNull(parsed.data.recipientName),
      recipient_email: parsed.data.recipientEmail,
      patient_age: patientAge || null,
      patient_sex: emptyToNull(parsed.data.patientSex),
      subject_line: template?.title ?? DEFAULT_LETTER_TITLES[parsed.data.letterType],
      body,
      physiotherapist_name:
        emptyToNull(parsed.data.physiotherapistName) ??
        template?.physiotherapist_name ??
        siteConfig.founder.name,
      qualifications:
        emptyToNull(parsed.data.qualifications) ?? template?.qualifications ?? siteConfig.founder.credentials,
      practice_name: practiceName,
      contact: emptyToNull(parsed.data.contact) ?? template?.contact ?? siteConfig.phoneDisplay,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create letter" };
  revalidateLetterPaths(parsed.data.patientId, data.id);
  redirect(routes.admin.letter(data.id));
}

export async function updateLetterAction(
  _prev: LetterActionState,
  formData: FormData,
): Promise<LetterActionState> {
  await requireRole([...LETTER_AUTHOR_ROLES]);
  const parsed = updateLetterSchema.safeParse({
    id: formData.get("id"),
    letterDate: formData.get("letterDate"),
    attendanceDate: formData.get("attendanceDate") || null,
    appointmentId: formData.get("appointmentId") || null,
    recipientName: formData.get("recipientName") || null,
    recipientEmail: formData.get("recipientEmail") || null,
    patientAge: formData.get("patientAge") || null,
    patientSex: formData.get("patientSex") || null,
    subjectLine: formData.get("subjectLine") || null,
    body: formData.get("body"),
    physiotherapistName: formData.get("physiotherapistName"),
    qualifications: formData.get("qualifications") || null,
    practiceName: formData.get("practiceName") || null,
    contact: formData.get("contact") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid letter details" };
  }

  const supabase = await createClient();
  const { data: existing, error: loadError } = await supabase
    .from("clinical_letters")
    .select("id, status, patient_id")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (loadError || !existing) return { error: loadError?.message ?? "Letter not found" };
  if (!canEditLetter(existing.status)) {
    return { error: "Signed letters cannot be edited. Create a new letter instead." };
  }

  const { error } = await supabase
    .from("clinical_letters")
    .update({
      letter_date: parsed.data.letterDate,
      attendance_date: emptyToNull(parsed.data.attendanceDate) ?? parsed.data.letterDate,
      appointment_id: emptyToNull(parsed.data.appointmentId),
      recipient_name: emptyToNull(parsed.data.recipientName),
      recipient_email: parsed.data.recipientEmail,
      patient_age: emptyToNull(parsed.data.patientAge),
      patient_sex: emptyToNull(parsed.data.patientSex),
      subject_line: emptyToNull(parsed.data.subjectLine),
      body: parsed.data.body,
      physiotherapist_name: parsed.data.physiotherapistName,
      qualifications: emptyToNull(parsed.data.qualifications),
      practice_name: emptyToNull(parsed.data.practiceName) ?? siteConfig.practiceName,
      contact: emptyToNull(parsed.data.contact),
    })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };
  revalidateLetterPaths(existing.patient_id, parsed.data.id);
  return { success: "Draft saved" };
}

export async function signLetterAction(
  _prev: LetterActionState,
  formData: FormData,
): Promise<LetterActionState> {
  const profile = await requireRole([...LETTER_AUTHOR_ROLES]);
  const parsed = signLetterSchema.safeParse({
    id: formData.get("id"),
    signatureData: formData.get("signatureData"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Signature is required" };
  }

  const supabase = await createClient();
  const { data: existing, error: loadError } = await supabase
    .from("clinical_letters")
    .select("id, status, patient_id, body")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (loadError || !existing) return { error: loadError?.message ?? "Letter not found" };
  if (!canSignLetter(existing.status)) return { error: "This letter is already signed." };
  if (!existing.body.trim()) return { error: "Add letter content before signing." };

  const { error } = await supabase
    .from("clinical_letters")
    .update({
      signature_data: parsed.data.signatureData,
      signed_at: new Date().toISOString(),
      signed_by: profile.id,
      status: "signed",
    })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };
  revalidateLetterPaths(existing.patient_id, parsed.data.id);
  return { success: "Letter signed" };
}

export async function sendLetterAction(letterId: string): Promise<LetterActionState> {
  await requireRole([...LETTER_AUTHOR_ROLES]);
  const supabase = await createClient();
  const { data: letter, error } = await supabase
    .from("clinical_letters")
    .select(
      "id, status, patient_id, letter_type, subject_line, body, recipient_email, recipient_name, patients(first_name, last_name)",
    )
    .eq("id", letterId)
    .maybeSingle();

  if (error || !letter) return { error: error?.message ?? "Letter not found" };
  if (!canSendLetter(letter.status)) return { error: "Sign the letter before sending it." };

  const patient = (
    Array.isArray(letter.patients) ? letter.patients[0] : letter.patients
  ) as { first_name?: string; last_name?: string } | null;
  const patientName = `${patient?.first_name ?? ""} ${patient?.last_name ?? ""}`.trim() || "a patient";
  const recipient = await resolvePatientInvoiceRecipient(letter.patient_id);
  if (!recipient.email) return { error: "No patient or billing email address on file" };

  const letterTitle =
    letter.subject_line?.trim() || letterTypeLabel(letter.letter_type);
  const payload = {
    letterId: letter.id,
    letterType: letter.letter_type,
    letterTitle,
    firstName: recipient.firstName,
    patientName,
    body: letter.body,
  };

  await enqueueNotification({
    templateKey: "letter.sent",
    recipient: recipient.email,
    payload,
  });

  const extra = letter.recipient_email?.trim().toLowerCase() ?? "";
  if (extra && extra !== recipient.email) {
    await enqueueNotification({
      templateKey: "letter.sent.copy",
      recipient: extra,
      payload: {
        ...payload,
        firstName: greetingFirstName(letter.recipient_name, "Doctor"),
      },
    });
  }

  const sentTo = extra && extra !== recipient.email ? `${recipient.email}, ${extra}` : recipient.email;
  const { error: updateError } = await supabase
    .from("clinical_letters")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_to: sentTo,
    })
    .eq("id", letterId);
  if (updateError) return { error: updateError.message };

  await drainEmailOutbox();
  revalidateLetterPaths(letter.patient_id, letter.id);
  return { success: extra ? `Sent to ${sentTo}` : `Sent to ${recipient.email}` };
}

export async function updateLetterTemplateAction(
  _prev: LetterActionState,
  formData: FormData,
): Promise<LetterActionState> {
  await requireRole([...LETTER_AUTHOR_ROLES]);
  const parsed = letterTemplateSchema.safeParse({
    letterType: formData.get("letterType"),
    title: formData.get("title"),
    body: formData.get("body"),
    physiotherapistName: formData.get("physiotherapistName"),
    qualifications: formData.get("qualifications") || null,
    contact: formData.get("contact") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid template" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("clinical_letter_templates")
    .update({
      title: parsed.data.title,
      body: parsed.data.body,
      physiotherapist_name: parsed.data.physiotherapistName,
      qualifications: emptyToNull(parsed.data.qualifications),
      contact: emptyToNull(parsed.data.contact),
    })
    .eq("letter_type", parsed.data.letterType);

  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/admin/letters");
  return { success: "Template saved" };
}
