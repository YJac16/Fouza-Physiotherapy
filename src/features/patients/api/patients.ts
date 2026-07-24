import { requireStaff, requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { CreatePatientInput, UpdatePatientInput } from "@/features/patients/schemas/patient";

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
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
      `first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`,
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

/**
 * Create a new patient record. Staff only.
 */
export async function createPatient(input: CreatePatientInput) {
  await requireStaff();
  const supabase = await createClient();
  return supabase
    .from("patients")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      email: emptyToNull(input.email),
      phone: emptyToNull(input.phone),
      date_of_birth: emptyToNull(input.dateOfBirth),
      medical_aid_name: emptyToNull(input.medicalAidName),
      medical_aid_number: emptyToNull(input.medicalAidNumber),
      notes: emptyToNull(input.notes),
    })
    .select("id")
    .single();
}

/**
 * Update an existing patient record. Staff only.
 */
export async function updatePatient(input: UpdatePatientInput) {
  await requireStaff();
  const supabase = await createClient();
  return supabase
    .from("patients")
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      email: emptyToNull(input.email),
      phone: emptyToNull(input.phone),
      date_of_birth: emptyToNull(input.dateOfBirth),
      medical_aid_name: emptyToNull(input.medicalAidName),
      medical_aid_number: emptyToNull(input.medicalAidNumber),
      notes: emptyToNull(input.notes),
    })
    .eq("id", input.id);
}

/**
 * Fetch the patient record linked to the signed-in user's profile.
 */
export async function getMyPatientRecord() {
  const profile = await requireUser();
  const supabase = await createClient();
  return supabase.from("patients").select("*").eq("profile_id", profile.id).maybeSingle();
}

/**
 * Chronological patient timeline: appointments, clinical notes, invoices. Staff only.
 */
export async function getPatientTimeline(patientId: string) {
  await requireStaff();
  const supabase = await createClient();

  const [appointments, notes, invoices] = await Promise.all([
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
  ]);

  return {
    appointments: appointments.data ?? [],
    notes: notes.data ?? [],
    invoices: invoices.data ?? [],
  };
}

/**
 * List appointments for the signed-in patient. Used by the patient portal.
 */
export async function listMyAppointments(upcomingOnly = false) {
  const profile = await requireUser();
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (!patient) return { data: [], error: null };

  let request = supabase
    .from("appointments")
    .select("id, starts_at, ends_at, status, notes, service_id, services(name)")
    .eq("patient_id", patient.id)
    .order("starts_at", { ascending: true })
    .limit(30);

  if (upcomingOnly) {
    request = request.gte("starts_at", new Date().toISOString());
  }

  return request;
}
