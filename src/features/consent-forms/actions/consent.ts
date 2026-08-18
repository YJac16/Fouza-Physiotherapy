"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { buildConsentVersionLabel } from "@/features/booking/lib/eligibility";
import {
  ensureAccountHolderPortalInvite,
  ensurePatientPortalInvite,
} from "@/features/auth/lib/portal-invite";
import { requireStaff, requireUser } from "@/lib/auth/guards";
import { getRequestIpAddress } from "@/lib/http/request-ip";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  buildSignaturePayload,
  joinPostalAddress,
  parseAccountResponsible,
  portalConsentPatientUpdate,
  portalInviteFromConsentAnswers,
  splitFullName,
  staffConsentPatientUpdate,
  type ConsentSignerRole,
} from "@/features/consent-forms/lib/staff-capture";

const signSchema = z.object({
  formId: z.string().uuid(),
  patientId: z.string().uuid(),
  signatureData: z.string().min(2),
  typedName: z.string().min(2).optional(),
});

const packageFields = {
  intakeFormId: z.string().uuid(),
  appointmentId: z.string().uuid().optional().nullable(),
  treatmentFormId: z.string().uuid(),
  accountFormId: z.string().uuid(),
  treatmentSignature: z.string().min(2),
  accountSignature: z.string().min(2),
  answersJson: z.string().min(2),
  treatmentSignerRole: z.enum(["patient", "account_holder", "proxy"]).optional(),
  accountSignerRole: z.enum(["patient", "account_holder", "proxy"]).optional(),
  accountTypedName: z.string().min(2).optional(),
};

const packageSchema = z.object({
  ...packageFields,
  patientId: z.string().uuid(),
});

const createStaffPackageSchema = z.object(packageFields);

export type ConsentActionState = { error?: string; success?: string; id?: string };

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

  const ipAddress = await getRequestIpAddress();
  const supabase = await createClient();
  const { error } = await supabase.from("consent_signatures").insert({
    form_id: parsed.data.formId,
    patient_id: parsed.data.patientId,
    signature_data: signaturePayload,
    ip_address: ipAddress,
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

  const { data: patient } = await supabase
    .from("patients")
    .select("id, profile_id, informed_consent_signed")
    .eq("id", parsed.data.patientId)
    .maybeSingle();
  if (!patient || patient.profile_id !== user.id) {
    return { error: "Patient record not linked to your account" };
  }

  if (patient.informed_consent_signed) {
    return { error: "Informed consent is already on file for your account." };
  }

  const medicalAid = String(answers.medicalAid ?? "").trim();
  const medicalAidNumber = String(answers.medicalAidNumber ?? "").trim();
  const dependant = String(answers.dependantCode ?? "").trim();
  const idNumber = String(answers.idNumber ?? "").trim();
  const postal = [answers.street, answers.suburb, answers.areaCode]
    .map((v) => String(v ?? "").trim())
    .filter(Boolean)
    .join(", ");

  const { error: demoError } = await supabase
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
  if (demoError) return { error: demoError.message };

  const { error: intakeError } = await supabase.from("intake_responses").insert({
    form_id: parsed.data.intakeFormId,
    patient_id: parsed.data.patientId,
    appointment_id: parsed.data.appointmentId,
    answers,
  });
  if (intakeError) return { error: intakeError.message };

  const treatmentPayload = buildSignaturePayload({
    typedName,
    pad: parsed.data.treatmentSignature,
    role: "patient",
  });
  const accountPayload = buildSignaturePayload({
    typedName,
    pad: parsed.data.accountSignature,
    role: "account_holder",
  });

  const ipAddress = await getRequestIpAddress();
  const signedAt = new Date().toISOString();

  const { data: formVersions } = await supabase
    .from("consent_forms")
    .select("id, slug, version")
    .in("id", [parsed.data.treatmentFormId, parsed.data.accountFormId]);

  const { error: sigError } = await supabase.from("consent_signatures").insert([
    {
      form_id: parsed.data.treatmentFormId,
      patient_id: parsed.data.patientId,
      signature_data: treatmentPayload,
      ip_address: ipAddress,
      signed_at: signedAt,
    },
    {
      form_id: parsed.data.accountFormId,
      patient_id: parsed.data.patientId,
      signature_data: accountPayload,
      ip_address: ipAddress,
      signed_at: signedAt,
    },
  ]);
  if (sigError) return { error: sigError.message };

  const versionLabel = buildConsentVersionLabel(
    (formVersions ?? []).map((f) => ({ slug: f.slug, version: f.version })),
  );

  const admin = createServiceClient();
  const { error: flagError } = await admin
    .from("patients")
    .update(
      portalConsentPatientUpdate({
        signedAt,
        versionLabel: versionLabel || null,
      }),
    )
    .eq("id", parsed.data.patientId);
  if (flagError) return { error: flagError.message };

  revalidatePath("/portal/forms");
  revalidatePath("/portal");
  revalidatePath("/book");
  revalidatePath("/admin/consent-forms");
  revalidatePath("/admin/patients");
  revalidatePath(`/admin/patients/${parsed.data.patientId}`);
  return { success: "Informed consent submitted. Thank you." };
}

type StaffPackageFields = z.infer<typeof createStaffPackageSchema>;

function staffPackageFromFormData(formData: FormData) {
  return {
    intakeFormId: formData.get("intakeFormId"),
    appointmentId: formData.get("appointmentId") || null,
    treatmentFormId: formData.get("treatmentFormId"),
    accountFormId: formData.get("accountFormId"),
    treatmentSignature: formData.get("treatmentSignature"),
    accountSignature: formData.get("accountSignature"),
    answersJson: formData.get("answersJson"),
    treatmentSignerRole: formData.get("treatmentSignerRole") || "patient",
    accountSignerRole: formData.get("accountSignerRole") || "account_holder",
    accountTypedName: formData.get("accountTypedName") || undefined,
  };
}

function parseConsentAnswers(answersJson: string): { answers?: Record<string, unknown>; error?: string } {
  try {
    return { answers: JSON.parse(answersJson) as Record<string, unknown> };
  } catch {
    return { error: "Invalid form answers" };
  }
}

function validateStaffConsentAnswers(
  answers: Record<string, unknown>,
  accountTypedName?: string,
): { error?: string; treatmentTypedName?: string; accountTypedName?: string } {
  if (answers.undertaking !== "yes") {
    return { error: "The undertaking must be accepted (Yes) to continue." };
  }
  if (answers.pleaseNote !== "agree") {
    return { error: "Please Note must be agreed to continue." };
  }

  const treatmentTypedName = String(answers.typedFullName ?? "").trim();
  if (treatmentTypedName.length < 2) {
    return { error: "Type the patient's (or proxy's) full name to sign treatment consent." };
  }
  const resolvedAccountName =
    accountTypedName?.trim() ||
    String(parseAccountResponsible(answers).name ?? treatmentTypedName).trim();
  if (resolvedAccountName.length < 2) {
    return { error: "Type the account holder's full name to sign account responsibility." };
  }
  return { treatmentTypedName, accountTypedName: resolvedAccountName };
}

async function persistStaffConsentPackage(input: {
  staffProfileId: string;
  patientId: string;
  parsed: StaffPackageFields;
  answers: Record<string, unknown>;
  treatmentTypedName: string;
  accountTypedName: string;
  created: boolean;
}): Promise<ConsentActionState> {
  const admin = createServiceClient();
  const { data: patient } = await admin
    .from("patients")
    .select("id, informed_consent_signed")
    .eq("id", input.patientId)
    .maybeSingle();
  if (!patient) return { error: "Patient not found" };
  if (patient.informed_consent_signed) {
    return { error: "Informed consent is already on file for this patient." };
  }

  const medicalAid = String(input.answers.medicalAid ?? "").trim();
  const medicalAidNumber = String(input.answers.medicalAidNumber ?? "").trim();
  const dependant = String(input.answers.dependantCode ?? "").trim();
  const idNumber = String(input.answers.idNumber ?? "").trim();
  const postal = joinPostalAddress(input.answers);
  const responsible = parseAccountResponsible(input.answers);
  const patientFullName = String(input.answers.fullName ?? "").trim();
  const names = splitFullName(patientFullName);
  const patientEmail = String(input.answers.email ?? "").trim().toLowerCase() || null;
  const patientPhone = String(input.answers.contactNumber ?? "").trim() || null;

  const { error: demoError } = await admin
    .from("patients")
    .update({
      first_name: names.firstName || undefined,
      last_name: names.lastName || undefined,
      medical_aid_name: medicalAid || null,
      medical_aid_number: medicalAidNumber || null,
      medical_aid_dependant_code: dependant || null,
      id_number: idNumber || null,
      postal_address: postal || null,
      phone: patientPhone ?? undefined,
      email: patientEmail ?? undefined,
      billing_name: responsible.sameAsPatient
        ? patientFullName || null
        : responsible.name?.trim() || null,
      billing_email: responsible.sameAsPatient
        ? patientEmail
        : responsible.email?.trim().toLowerCase() || null,
      billing_phone: responsible.sameAsPatient
        ? patientPhone
        : responsible.contactNumber?.trim() || null,
      billing_address: responsible.sameAsPatient
        ? postal || null
        : responsible.postalAddress?.trim() || null,
    })
    .eq("id", input.patientId);
  if (demoError) return { error: demoError.message };

  let contactId: string | null = null;
  if (!responsible.sameAsPatient && responsible.name?.trim() && responsible.email?.trim()) {
    const email = responsible.email.trim().toLowerCase();
    const { data: existingContact } = await admin
      .from("patient_contacts")
      .select("id")
      .eq("patient_id", input.patientId)
      .eq("is_account_holder", true)
      .maybeSingle();
    const contactPayload = {
      patient_id: input.patientId,
      full_name: responsible.name.trim(),
      email,
      phone: responsible.contactNumber?.trim() || null,
      is_account_holder: true,
      can_view_portal: true,
      can_book: true,
    };
    if (existingContact) {
      const { error } = await admin
        .from("patient_contacts")
        .update(contactPayload)
        .eq("id", existingContact.id);
      if (error) return { error: error.message };
      contactId = existingContact.id;
    } else {
      const { data: createdContact, error } = await admin
        .from("patient_contacts")
        .insert(contactPayload)
        .select("id")
        .single();
      if (error || !createdContact) {
        return { error: error?.message ?? "Could not save account holder" };
      }
      contactId = createdContact.id;
    }
  }

  const { error: intakeError } = await admin.from("intake_responses").insert({
    form_id: input.parsed.intakeFormId,
    patient_id: input.patientId,
    appointment_id: input.parsed.appointmentId,
    answers: input.answers,
  });
  if (intakeError) return { error: intakeError.message };

  const treatmentRole = (input.parsed.treatmentSignerRole ?? "patient") as ConsentSignerRole;
  const accountRole = (input.parsed.accountSignerRole ?? "account_holder") as ConsentSignerRole;
  const ipAddress = await getRequestIpAddress();
  const signedAt = new Date().toISOString();

  const { data: formVersions } = await admin
    .from("consent_forms")
    .select("id, slug, version")
    .in("id", [input.parsed.treatmentFormId, input.parsed.accountFormId]);

  const { error: sigError } = await admin.from("consent_signatures").insert([
    {
      form_id: input.parsed.treatmentFormId,
      patient_id: input.patientId,
      signature_data: buildSignaturePayload({
        typedName: input.treatmentTypedName,
        pad: input.parsed.treatmentSignature,
        role: treatmentRole,
      }),
      ip_address: ipAddress,
      signed_at: signedAt,
    },
    {
      form_id: input.parsed.accountFormId,
      patient_id: input.patientId,
      signature_data: buildSignaturePayload({
        typedName: input.accountTypedName,
        pad: input.parsed.accountSignature,
        role: accountRole,
      }),
      ip_address: ipAddress,
      signed_at: signedAt,
    },
  ]);
  if (sigError) return { error: sigError.message };

  const versionLabel = buildConsentVersionLabel(
    (formVersions ?? []).map((form) => ({ slug: form.slug, version: form.version })),
  );

  const { error: flagError } = await admin
    .from("patients")
    .update(
      staffConsentPatientUpdate({
        staffProfileId: input.staffProfileId,
        signedAt,
        versionLabel: versionLabel || null,
      }),
    )
    .eq("id", input.patientId);
  if (flagError) return { error: flagError.message };

  const invitePlan = portalInviteFromConsentAnswers(input.answers);

  let inviteError: string | undefined;
  if (invitePlan.kind === "patient") {
    const invite = await ensurePatientPortalInvite({
      email: invitePlan.email,
      fullName: invitePlan.fullName,
      patientId: input.patientId,
    });
    inviteError = invite.error;
  } else if (invitePlan.kind === "family") {
    const invite = await ensureAccountHolderPortalInvite({
      email: invitePlan.email,
      fullName: invitePlan.fullName,
      patientId: input.patientId,
      contactId,
    });
    inviteError = invite.error;
  }

  revalidatePath("/admin/consent-forms");
  revalidatePath(`/admin/consent-forms/${input.patientId}`);
  revalidatePath("/admin/patients");
  revalidatePath(`/admin/patients/${input.patientId}`);
  revalidatePath("/admin/patients/new");

  const success = input.created
    ? "Patient created and informed consent captured."
    : "Informed consent captured for this patient.";
  return {
    success: inviteError ? `${success} Portal invite could not be sent.` : success,
    id: input.patientId,
  };
}

export async function submitStaffConsentPackageAction(
  _prev: ConsentActionState,
  formData: FormData,
): Promise<ConsentActionState> {
  const staff = await requireStaff();
  const parsed = packageSchema.safeParse({
    ...staffPackageFromFormData(formData),
    patientId: formData.get("patientId"),
  });
  if (!parsed.success) return { error: "Please complete all required fields" };

  const parsedAnswers = parseConsentAnswers(parsed.data.answersJson);
  if (parsedAnswers.error || !parsedAnswers.answers) {
    return { error: parsedAnswers.error ?? "Invalid form answers" };
  }

  const validated = validateStaffConsentAnswers(
    parsedAnswers.answers,
    parsed.data.accountTypedName,
  );
  if (validated.error || !validated.treatmentTypedName || !validated.accountTypedName) {
    return { error: validated.error ?? "Please complete all required fields" };
  }

  return persistStaffConsentPackage({
    staffProfileId: staff.id,
    patientId: parsed.data.patientId,
    parsed: parsed.data,
    answers: parsedAnswers.answers,
    treatmentTypedName: validated.treatmentTypedName,
    accountTypedName: validated.accountTypedName,
    created: false,
  });
}

export async function createPatientWithStaffConsentAction(
  _prev: ConsentActionState,
  formData: FormData,
): Promise<ConsentActionState> {
  const staff = await requireStaff();
  const parsed = createStaffPackageSchema.safeParse(staffPackageFromFormData(formData));
  if (!parsed.success) return { error: "Please complete all required fields" };

  const parsedAnswers = parseConsentAnswers(parsed.data.answersJson);
  if (parsedAnswers.error || !parsedAnswers.answers) {
    return { error: parsedAnswers.error ?? "Invalid form answers" };
  }

  const validated = validateStaffConsentAnswers(
    parsedAnswers.answers,
    parsed.data.accountTypedName,
  );
  if (validated.error || !validated.treatmentTypedName || !validated.accountTypedName) {
    return { error: validated.error ?? "Please complete all required fields" };
  }

  const patientFullName = String(parsedAnswers.answers.fullName ?? "").trim();
  const names = splitFullName(patientFullName);
  if (!names.firstName) {
    return { error: "Patient name is required." };
  }

  const admin = createServiceClient();
  const { data: created, error: createError } = await admin
    .from("patients")
    .insert({
      first_name: names.firstName,
      last_name: names.lastName || names.firstName,
      email: String(parsedAnswers.answers.email ?? "").trim().toLowerCase() || null,
      phone: String(parsedAnswers.answers.contactNumber ?? "").trim() || null,
    })
    .select("id")
    .single();
  if (createError || !created) {
    return { error: createError?.message ?? "Could not create patient" };
  }

  return persistStaffConsentPackage({
    staffProfileId: staff.id,
    patientId: created.id,
    parsed: parsed.data,
    answers: parsedAnswers.answers,
    treatmentTypedName: validated.treatmentTypedName,
    accountTypedName: validated.accountTypedName,
    created: true,
  });
}

export async function setPatientVerifiedAction(patientId: string, verified: boolean) {
  await requireStaff();
  const parsed = z.string().uuid().safeParse(patientId);
  if (!parsed.success) return { error: "Invalid patient" };

  const admin = createServiceClient();
  const { error } = await admin
    .from("patients")
    .update({ verified_account: verified })
    .eq("id", parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/patients");
  revalidatePath(`/admin/patients/${parsed.data}`);
  revalidatePath("/admin/consent-forms");
  return { error: null as string | null, success: verified ? "Patient verified" : "Verification removed" };
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
