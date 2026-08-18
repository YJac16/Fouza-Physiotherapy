import { requireAdmin, requireStaff, requireUser } from "@/lib/auth/guards";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CreatePatientInput, UpdatePatientInput } from "@/features/patients/schemas/patient";
import {
  resolveAccessiblePatients,
  type AccessiblePatient,
} from "@/features/patients/lib/access";
import {
  getSelectedPortalPatientId,
  pickPortalPatient,
} from "@/features/patients/lib/portal-context";
import { ensureAccountHolderPortalInvite } from "@/features/auth/lib/portal-invite";

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function patientWriteFields(input: CreatePatientInput | UpdatePatientInput) {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    email: emptyToNull(input.email),
    phone: emptyToNull(input.phone),
    date_of_birth: emptyToNull(input.dateOfBirth),
    medical_aid_name: emptyToNull(input.medicalAidName),
    medical_aid_number: emptyToNull(input.medicalAidNumber),
    medical_aid_dependant_code: emptyToNull(input.medicalAidDependantCode),
    id_number: emptyToNull(input.idNumber),
    postal_address: emptyToNull(input.postalAddress),
    notes: emptyToNull(input.notes),
    billing_name: emptyToNull(input.billingName),
    billing_email: emptyToNull(input.billingEmail)?.toLowerCase() ?? null,
    billing_phone: emptyToNull(input.billingPhone),
    billing_address: emptyToNull(input.billingAddress),
  };
}

async function upsertAccountHolderContact(
  patientId: string,
  input: CreatePatientInput | UpdatePatientInput,
) {
  const email = emptyToNull(input.billingEmail)?.toLowerCase() ?? null;
  const fullName = emptyToNull(input.billingName);
  if (!email || !fullName) {
    return { contactId: null as string | null, error: null as string | null, invited: false };
  }

  const admin = createServiceClient();
  const payload = {
    patient_id: patientId,
    full_name: fullName,
    email,
    phone: emptyToNull(input.billingPhone),
    relationship: emptyToNull(input.accountHolderRelationship),
    is_account_holder: true,
    can_view_portal: true,
    can_book: true,
  };

  const { data: existing } = await admin
    .from("patient_contacts")
    .select("id, profile_id")
    .eq("patient_id", patientId)
    .eq("is_account_holder", true)
    .maybeSingle();

  let contactId = existing?.id ?? null;
  if (existing) {
    const { error } = await admin.from("patient_contacts").update(payload).eq("id", existing.id);
    if (error) return { contactId, error: error.message, invited: false };
  } else {
    const { data: created, error } = await admin
      .from("patient_contacts")
      .insert(payload)
      .select("id")
      .single();
    if (error || !created) {
      return { contactId: null, error: error?.message ?? "Could not save account holder", invited: false };
    }
    contactId = created.id;
  }

  let invited = false;
  if (input.inviteAccountHolder) {
    const invite = await ensureAccountHolderPortalInvite({
      email,
      fullName,
      patientId,
      contactId,
    });
    if (invite.error) return { contactId, error: invite.error, invited: false };
    invited = true;
  }

  return { contactId, error: null, invited };
}

/**
 * Search patients by name/email/phone. Staff only.
 */
export async function searchPatients(query?: string) {
  await requireStaff();
  const supabase = await createClient();
  let request = supabase
    .from("patients")
    .select("*")
    .order("last_name")
    .order("first_name")
    .limit(50);

  const term = query?.trim();
  if (term) {
    const pattern = `%${term}%`;
    request = request.or(
      `first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},billing_email.ilike.${pattern}`,
    );
  }

  return request;
}

/**
 * Fetch a single patient record by id. Staff only.
 */
export async function getPatient(id: string) {
  await requireStaff();
  const supabase = await createClient();
  return supabase.from("patients").select("*").eq("id", id).maybeSingle();
}

export async function listPatientContacts(patientId: string) {
  await requireStaff();
  const supabase = await createClient();
  return supabase
    .from("patient_contacts")
    .select("*")
    .eq("patient_id", patientId)
    .order("is_account_holder", { ascending: false });
}

/**
 * Create a new patient record. Staff only.
 */
export async function createPatient(input: CreatePatientInput) {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patients")
    .insert(patientWriteFields(input))
    .select("id")
    .single();
  if (error || !data) return { data: null, error, invited: false };

  const contact = await upsertAccountHolderContact(data.id, input);
  if (contact.error) return { data, error: { message: contact.error }, invited: false };
  return { data, error: null, invited: contact.invited };
}

/**
 * Update an existing patient record. Staff only.
 */
export async function updatePatient(input: UpdatePatientInput) {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("patients")
    .update(patientWriteFields(input))
    .eq("id", input.id);
  if (error) return { error, invited: false };

  const contact = await upsertAccountHolderContact(input.id, input);
  if (contact.error) return { error: { message: contact.error }, invited: false };
  return { error: null, invited: contact.invited };
}

/**
 * Fetch the patient record linked to the signed-in user's profile.
 */
export async function getMyPatientRecord() {
  const profile = await requireUser();
  const supabase = await createClient();
  return supabase.from("patients").select("*").eq("profile_id", profile.id).maybeSingle();
}

export async function listAccessiblePatients(): Promise<{
  data: AccessiblePatient[];
  error: { message: string } | null;
}> {
  const profile = await requireUser();
  const supabase = await createClient();
  const admin = createServiceClient();

  const [{ data: owned, error: ownedError }, { data: contacts, error: contactError }] =
    await Promise.all([
      supabase
        .from("patients")
        .select(
          "id, profile_id, first_name, last_name, email, phone, verified_account, informed_consent_signed",
        )
        .eq("profile_id", profile.id),
      admin
        .from("patient_contacts")
        .select(
          "patient_id, profile_id, can_view_portal, can_book, is_account_holder, patients(id, profile_id, first_name, last_name, email, phone, verified_account, informed_consent_signed)",
        )
        .eq("profile_id", profile.id)
        .eq("can_view_portal", true),
    ]);

  if (ownedError) return { data: [], error: { message: ownedError.message } };
  if (contactError) return { data: [], error: { message: contactError.message } };

  const contactPatients = (contacts ?? []).flatMap((row) => {
    const patient = (Array.isArray(row.patients) ? row.patients[0] : row.patients) as
      | {
          id: string;
          profile_id: string | null;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          verified_account: boolean;
          informed_consent_signed: boolean;
        }
      | null
      | undefined;
    if (!patient) return [];
    return [
      {
        id: patient.id,
        profileId: row.profile_id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        email: patient.email,
        phone: patient.phone,
        verifiedAccount: Boolean(patient.verified_account),
        informedConsentSigned: Boolean(patient.informed_consent_signed),
        patientId: row.patient_id,
        canViewPortal: Boolean(row.can_view_portal),
        canBook: Boolean(row.can_book),
        isAccountHolder: Boolean(row.is_account_holder),
      },
    ];
  });

  return {
    data: resolveAccessiblePatients(
      profile.id,
      (owned ?? []).map((patient) => ({
        id: patient.id,
        profileId: patient.profile_id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        email: patient.email,
        phone: patient.phone,
        verifiedAccount: Boolean(patient.verified_account),
        informedConsentSigned: Boolean(patient.informed_consent_signed),
      })),
      contactPatients,
    ),
    error: null,
  };
}

export async function getPortalView() {
  const { data: patients } = await listAccessiblePatients();
  const selectedId = await getSelectedPortalPatientId();
  const selected = pickPortalPatient(patients, selectedId);
  return { patients, selected };
}

/**
 * Ensure the signed-in user has a linked patients row (needed for consent + booking gates).
 * Matches existing email patient records when possible.
 * Does not attach a family contact as the patient.
 */
export async function ensureMyPatientRecord() {
  const profile = await requireUser();
  const supabase = await createClient();
  const admin = createServiceClient();

  const { data: existing } = await supabase
    .from("patients")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (existing) return { data: existing, error: null };

  const { data: asContact } = await admin
    .from("patient_contacts")
    .select("id")
    .eq("profile_id", profile.id)
    .limit(1)
    .maybeSingle();
  if (asContact) return { data: null, error: null };

  const email = profile.email.toLowerCase();
  const { data: byEmail } = await admin
    .from("patients")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (byEmail) {
    const { error: linkError } = await admin
      .from("patients")
      .update({ profile_id: profile.id })
      .eq("id", byEmail.id);
    if (linkError) return { data: null, error: linkError };

    const { data: linked } = await admin
      .from("patients")
      .select("*")
      .eq("id", byEmail.id)
      .single();
    return { data: linked, error: null };
  }

  const nameParts = (profile.full_name ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "Patient";
  const lastName = nameParts.slice(1).join(" ") || "Account";

  const { data: created, error } = await admin
    .from("patients")
    .insert({
      profile_id: profile.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: profile.phone,
    })
    .select("*")
    .single();

  return { data: created, error };
}

/**
 * Chronological patient timeline: appointments, clinical notes, invoices, assessments. Staff only.
 */
export async function getPatientTimeline(patientId: string) {
  await requireStaff();
  const supabase = await createClient();

  const [appointments, notes, invoices, assessments] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, starts_at, ends_at, status, notes")
      .eq("patient_id", patientId)
      .order("starts_at", { ascending: false })
      .limit(20),
    supabase
      .from("clinical_notes")
      .select("id, created_at, subjective, is_locked")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("invoices")
      .select("id, invoice_number, issue_date, total_cents, status")
      .eq("patient_id", patientId)
      .order("issue_date", { ascending: false })
      .limit(20),
    supabase
      .from("initial_assessments")
      .select("id, created_at, chief_complaint, pain_scale, is_locked")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return {
    appointments: appointments.data ?? [],
    notes: notes.data ?? [],
    invoices: invoices.data ?? [],
    assessments: assessments.data ?? [],
  };
}

/**
 * List appointments for accessible patients. Used by the patient portal.
 */
export async function listMyAppointments(upcomingOnly = false, patientId?: string | null) {
  const { data: accessible } = await listAccessiblePatients();
  const ids = accessible
    .filter((patient) => (patientId ? patient.id === patientId : true))
    .map((patient) => patient.id);
  if (!ids.length) return { data: [], error: null };

  const supabase = await createClient();
  let request = supabase
    .from("appointments")
    .select("id, starts_at, ends_at, status, notes, service_id, patient_id, services(name), patients(first_name, last_name)")
    .in("patient_id", ids)
    .order("starts_at", { ascending: true })
    .limit(50);

  if (upcomingOnly) {
    request = request.gte("starts_at", new Date().toISOString());
  }

  return request;
}

function normalizePersonName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

async function removeStorageFiles(
  bucket: "patient-documents" | "consent-signatures" | "invoices",
  paths: string[],
) {
  if (!paths.length) return;
  const admin = createServiceClient();
  const unique = [...new Set(paths.filter(Boolean))];
  const chunkSize = 100;
  for (let i = 0; i < unique.length; i += chunkSize) {
    await admin.storage.from(bucket).remove(unique.slice(i, i + chunkSize));
  }
}

export async function getPatientRelatedCounts(patientId: string) {
  await requireStaff();
  const supabase = await createClient();
  const [appointments, invoices, payments] = await Promise.all([
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("patient_id", patientId),
    supabase.from("invoices").select("id", { count: "exact", head: true }).eq("patient_id", patientId),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("patient_id", patientId),
  ]);

  return {
    appointments: appointments.count ?? 0,
    invoices: invoices.count ?? 0,
    payments: payments.count ?? 0,
  };
}

/**
 * Permanently delete a patient and related booking/billing rows. Admin only.
 */
export async function deletePatient(patientId: string, confirmationName: string) {
  await requireAdmin();
  const admin = createServiceClient();

  const { data: patient, error: patientError } = await admin
    .from("patients")
    .select("id, first_name, last_name, profile_id")
    .eq("id", patientId)
    .maybeSingle();

  if (patientError) return { error: patientError.message };
  if (!patient) return { error: "Patient not found" };

  const expected = normalizePersonName(`${patient.first_name} ${patient.last_name}`);
  const given = normalizePersonName(confirmationName);
  if (!given || given.toLowerCase() !== expected.toLowerCase()) {
    return { error: "Name does not match. Type the patient's first name and surname to confirm." };
  }

  const { data: documents } = await admin
    .from("documents")
    .select("storage_path")
    .eq("patient_id", patientId);

  const documentPaths = (documents ?? [])
    .map((doc) => doc.storage_path.replace(/^patient-documents\//, ""))
    .filter(Boolean);

  const { data: folderFiles } = await admin.storage
    .from("patient-documents")
    .list(patientId, { limit: 1000 });
  const folderPaths = (folderFiles ?? []).map((file) => `${patientId}/${file.name}`);

  await removeStorageFiles("patient-documents", [...documentPaths, ...folderPaths]);

  const { error: paymentsError } = await admin.from("payments").delete().eq("patient_id", patientId);
  if (paymentsError) return { error: paymentsError.message };

  const { error: invoicesError } = await admin.from("invoices").delete().eq("patient_id", patientId);
  if (invoicesError) return { error: invoicesError.message };

  const { error: appointmentsError } = await admin
    .from("appointments")
    .delete()
    .eq("patient_id", patientId);
  if (appointmentsError) return { error: appointmentsError.message };

  const profileId = patient.profile_id;

  const { error: deleteError } = await admin.from("patients").delete().eq("id", patientId);
  if (deleteError) return { error: deleteError.message };

  if (profileId) {
    const [{ data: profile }, { data: otherPatient }, { data: otherContact }] = await Promise.all([
      admin.from("profiles").select("id, role").eq("id", profileId).maybeSingle(),
      admin.from("patients").select("id").eq("profile_id", profileId).limit(1).maybeSingle(),
      admin.from("patient_contacts").select("id").eq("profile_id", profileId).limit(1).maybeSingle(),
    ]);

    if (profile?.role === "patient" && !otherPatient && !otherContact) {
      await admin.auth.admin.deleteUser(profileId);
    }
  }

  return { error: null };
}
