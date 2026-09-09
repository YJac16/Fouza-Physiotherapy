import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { listAccessiblePatients } from "@/features/patients/api/patients";
import type { ClinicalLetterType } from "@/features/clinical-letters/types/letter";

const LETTER_SELECT =
  "*, patients(first_name, last_name, email, date_of_birth, billing_email, billing_name)";

export async function listLetterTemplates() {
  await requireStaff();
  const supabase = await createClient();
  return supabase
    .from("clinical_letter_templates")
    .select("*")
    .order("letter_type");
}

export async function getLetterTemplate(letterType: ClinicalLetterType) {
  await requireStaff();
  const supabase = await createClient();
  return supabase
    .from("clinical_letter_templates")
    .select("*")
    .eq("letter_type", letterType)
    .maybeSingle();
}

export async function listStaffLetters(filters?: {
  patientId?: string;
  letterType?: ClinicalLetterType;
  status?: "draft" | "signed" | "sent";
}) {
  await requireStaff();
  const supabase = await createClient();
  let query = supabase
    .from("clinical_letters")
    .select(LETTER_SELECT)
    .order("created_at", { ascending: false })
    .limit(100);

  if (filters?.patientId) query = query.eq("patient_id", filters.patientId);
  if (filters?.letterType) query = query.eq("letter_type", filters.letterType);
  if (filters?.status) query = query.eq("status", filters.status);

  return query;
}

export async function getStaffLetter(id: string) {
  await requireStaff();
  const supabase = await createClient();
  return supabase.from("clinical_letters").select(LETTER_SELECT).eq("id", id).maybeSingle();
}

export async function listPatientLetters(patientId?: string | null) {
  const { data: accessible } = await listAccessiblePatients();
  const ids = accessible
    .filter((patient) => (patientId ? patient.id === patientId : true))
    .map((patient) => patient.id);
  if (!ids.length) return { data: [], error: null };
  const supabase = await createClient();
  return supabase
    .from("clinical_letters")
    .select("id, letter_type, status, subject_line, letter_date, created_at, patient_id")
    .in("patient_id", ids)
    .in("status", ["signed", "sent"])
    .order("letter_date", { ascending: false });
}

export async function getPatientLetter(id: string) {
  const { data: accessible } = await listAccessiblePatients();
  const ids = accessible.map((patient) => patient.id);
  if (!ids.length) return { data: null, error: "Not found" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinical_letters")
    .select(LETTER_SELECT)
    .eq("id", id)
    .in("patient_id", ids)
    .in("status", ["signed", "sent"])
    .maybeSingle();
  if (error || !data) return { data: null, error: error?.message ?? "Not found" };
  return { data, error: null };
}
