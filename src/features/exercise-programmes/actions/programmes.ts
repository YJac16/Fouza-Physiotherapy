"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff, requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

const exerciseSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  instructions: z.string().optional(),
  category: z.string().optional(),
});

const programmeSchema = z.object({
  patientId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional(),
});

export type ExerciseActionState = { error?: string; success?: string };

export async function createExerciseAction(
  _prev: ExerciseActionState,
  formData: FormData,
): Promise<ExerciseActionState> {
  await requireStaff();
  const parsed = exerciseSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    instructions: formData.get("instructions") || undefined,
    category: formData.get("category") || undefined,
  });
  if (!parsed.success) return { error: "Invalid exercise" };

  const supabase = await createClient();
  const { error } = await supabase.from("exercises").insert(parsed.data);
  if (error) return { error: error.message };
  revalidatePath("/admin/programmes");
  return { success: "Exercise created" };
}

export async function createProgrammeAction(
  _prev: ExerciseActionState,
  formData: FormData,
): Promise<ExerciseActionState> {
  await requireStaff();
  const parsed = programmeSchema.safeParse({
    patientId: formData.get("patientId"),
    practitionerId: formData.get("practitionerId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: "Invalid programme" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exercise_programmes")
    .insert({
      patient_id: parsed.data.patientId,
      practitioner_id: parsed.data.practitionerId,
      title: parsed.data.title,
      description: parsed.data.description,
      status: "active",
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  const exerciseName = formData.get("firstExercise")?.toString();
  if (exerciseName && data) {
    await supabase.from("programme_exercises").insert({
      programme_id: data.id,
      name: exerciseName,
      sort_order: 0,
    });
  }

  revalidatePath("/admin/programmes");
  return { success: "Programme assigned" };
}

export async function listPatientProgrammes() {
  const profile = await requireUser();
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!patient) return { data: [], error: null };
  return supabase
    .from("exercise_programmes")
    .select("*, programme_exercises(*)")
    .eq("patient_id", patient.id)
    .order("created_at", { ascending: false });
}

export async function listExercises() {
  await requireStaff();
  const supabase = await createClient();
  return supabase.from("exercises").select("*").eq("is_active", true).order("name");
}
