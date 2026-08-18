"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { routes } from "@/config/routes";
import {
  initialAssessmentSchema,
  objectiveFromFormData,
  subjectiveFromFormData,
  summarizeAssessment,
  type RegionAnnotation,
} from "@/features/initial-assessments/schemas/assessment";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export type AssessmentActionState = {
  error?: string;
  success?: string;
  id?: string;
};

function parseRegionNotes(raw: FormDataEntryValue | null): RegionAnnotation[] {
  if (!raw || typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RegionAnnotation[]) : [];
  } catch {
    return [];
  }
}

function parsePainScale(raw: FormDataEntryValue | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return n;
}

function friendlyDbError(message: string): string {
  if (/locked clinical notes/i.test(message)) {
    return "Locked assessments cannot be modified";
  }
  return message;
}

export async function upsertInitialAssessmentAction(
  _prev: AssessmentActionState,
  formData: FormData,
): Promise<AssessmentActionState> {
  await requireStaff();

  const regionNotes = parseRegionNotes(formData.get("regionNotes"));
  const subjective = subjectiveFromFormData(formData);
  const objective = objectiveFromFormData(formData);
  const summary = summarizeAssessment({
    subjective,
    objective,
    plan: formData.get("plan")?.toString() ?? "",
  });
  const parsed = initialAssessmentSchema.safeParse({
    patientId: formData.get("patientId"),
    practitionerId: formData.get("practitionerId"),
    appointmentId: formData.get("appointmentId") || null,
    chiefComplaint: summary.chiefComplaint ?? "",
    history: summary.history ?? "",
    painScale: parsePainScale(formData.get("painScale")),
    observations: summary.observations ?? "",
    plan: summary.plan ?? "",
    regionNotes,
    subjective,
    objective,
  });

  if (!parsed.success) {
    return { error: "Invalid assessment data. Check required fields and region notes." };
  }

  const id = formData.get("id")?.toString();
  const supabase = await createClient();

  if (id) {
    const { data: existing, error: existingError } = await supabase
      .from("initial_assessments")
      .select("id, patient_id, is_locked")
      .eq("id", id)
      .maybeSingle();

    if (existingError) return { error: friendlyDbError(existingError.message) };
    if (!existing) return { error: "Assessment not found" };
    if (existing.is_locked) return { error: "Locked assessments cannot be modified" };

    const { data: updated, error } = await supabase
      .from("initial_assessments")
      .update({
        appointment_id: parsed.data.appointmentId,
        chief_complaint: parsed.data.chiefComplaint || null,
        history: parsed.data.history || null,
        pain_scale: parsed.data.painScale,
        observations: parsed.data.observations || null,
        plan: parsed.data.plan || null,
        region_notes: parsed.data.regionNotes as unknown as Json,
        subjective: parsed.data.subjective as unknown as Json,
        objective: parsed.data.objective as unknown as Json,
      })
      .eq("id", id)
      .eq("is_locked", false)
      .select("id")
      .maybeSingle();

    if (error) return { error: friendlyDbError(error.message) };
    if (!updated) return { error: "Assessment could not be updated" };

    revalidatePath(routes.admin.initialAssessments);
    revalidatePath(routes.admin.initialAssessment(id));
    revalidatePath(routes.admin.patient(existing.patient_id));
    return { success: "Assessment updated", id };
  }

  const { data, error } = await supabase
    .from("initial_assessments")
    .insert({
      patient_id: parsed.data.patientId,
      practitioner_id: parsed.data.practitionerId,
      appointment_id: parsed.data.appointmentId,
      chief_complaint: parsed.data.chiefComplaint || null,
      history: parsed.data.history || null,
      pain_scale: parsed.data.painScale,
      observations: parsed.data.observations || null,
      plan: parsed.data.plan || null,
      region_notes: parsed.data.regionNotes as unknown as Json,
      subjective: parsed.data.subjective as unknown as Json,
      objective: parsed.data.objective as unknown as Json,
    })
    .select("id")
    .single();

  if (error) return { error: friendlyDbError(error.message) };

  revalidatePath(routes.admin.initialAssessments);
  revalidatePath(routes.admin.patient(parsed.data.patientId));
  redirect(routes.admin.initialAssessment(data.id));
}

export async function lockInitialAssessmentAction(
  assessmentId: string,
): Promise<AssessmentActionState> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("initial_assessments")
    .update({ is_locked: true })
    .eq("id", assessmentId)
    .select("id, patient_id")
    .maybeSingle();
  if (error) return { error: friendlyDbError(error.message) };
  if (!data) return { error: "Assessment not found" };
  revalidatePath(routes.admin.initialAssessments);
  revalidatePath(routes.admin.initialAssessment(assessmentId));
  revalidatePath(routes.admin.patient(data.patient_id));
  return { success: "Assessment locked" };
}

export async function listInitialAssessments(patientId?: string) {
  await requireStaff();
  const supabase = await createClient();
  let query = supabase
    .from("initial_assessments")
    .select(
      "id, patient_id, practitioner_id, chief_complaint, pain_scale, is_locked, created_at, region_notes",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (patientId) query = query.eq("patient_id", patientId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
