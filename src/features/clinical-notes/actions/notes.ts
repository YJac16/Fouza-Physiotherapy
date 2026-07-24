"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { soapNoteSchema } from "@/features/clinical-notes/schemas/note";

export type NoteActionState = { error?: string; success?: string; id?: string };

export async function upsertClinicalNoteAction(
  _prev: NoteActionState,
  formData: FormData,
): Promise<NoteActionState> {
  await requireStaff();
  const parsed = soapNoteSchema.safeParse({
    patientId: formData.get("patientId"),
    practitionerId: formData.get("practitionerId"),
    appointmentId: formData.get("appointmentId") || null,
    subjective: formData.get("subjective") || "",
    objective: formData.get("objective") || "",
    assessment: formData.get("assessment") || "",
    plan: formData.get("plan") || "",
  });
  if (!parsed.success) return { error: "Invalid note data" };

  const id = formData.get("id")?.toString();
  const supabase = await createClient();

  if (id) {
    const { error } = await supabase
      .from("clinical_notes")
      .update({
        subjective: parsed.data.subjective,
        objective: parsed.data.objective,
        assessment: parsed.data.assessment,
        plan: parsed.data.plan,
        appointment_id: parsed.data.appointmentId,
      })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/clinical-notes");
    return { success: "Note updated", id };
  }

  const { data, error } = await supabase
    .from("clinical_notes")
    .insert({
      patient_id: parsed.data.patientId,
      practitioner_id: parsed.data.practitionerId,
      appointment_id: parsed.data.appointmentId,
      subjective: parsed.data.subjective,
      objective: parsed.data.objective,
      assessment: parsed.data.assessment,
      plan: parsed.data.plan,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/clinical-notes");
  return { success: "Note created", id: data.id };
}

export async function lockClinicalNoteAction(noteId: string): Promise<NoteActionState> {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("clinical_notes")
    .update({ is_locked: true })
    .eq("id", noteId);
  if (error) return { error: error.message };
  revalidatePath("/admin/clinical-notes");
  return { success: "Note locked" };
}

export async function listClinicalNotes(patientId?: string) {
  await requireStaff();
  const supabase = await createClient();
  let query = supabase
    .from("clinical_notes")
    .select("*")
    .order("created_at", { ascending: false });
  if (patientId) query = query.eq("patient_id", patientId);
  return query;
}
