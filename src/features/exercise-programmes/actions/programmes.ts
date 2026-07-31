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
  media_url: z.string().optional(),
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
  const mediaRaw = formData.get("mediaUrl")?.toString()?.trim() || undefined;
  const parsed = exerciseSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    instructions: formData.get("instructions") || undefined,
    category: formData.get("category") || undefined,
    media_url: mediaRaw,
  });
  if (!parsed.success) return { error: "Invalid exercise" };

  const supabase = await createClient();
  const { error } = await supabase.from("exercises").insert({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    instructions: parsed.data.instructions,
    category: parsed.data.category,
    media_url: parsed.data.media_url ?? null,
    is_active: true,
  });
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

  const exerciseIds = Array.from(
    new Set(formData.getAll("exerciseIds").map(String).filter(Boolean)),
  );
  if (!exerciseIds.length) {
    return { error: "Select at least one exercise from the library" };
  }

  const supabase = await createClient();
  const { data: libraryExercises, error: libraryError } = await supabase
    .from("exercises")
    .select("id, name, media_url")
    .in("id", exerciseIds)
    .eq("is_active", true);

  if (libraryError) return { error: libraryError.message };
  if (!libraryExercises?.length) {
    return { error: "Selected exercises were not found in the library" };
  }
  if (libraryExercises.length !== exerciseIds.length) {
    return {
      error:
        "One or more selected exercises are missing or inactive. Refresh and try again.",
    };
  }

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

  const sets = Number(formData.get("sets") ?? 0) || null;
  const reps = Number(formData.get("reps") ?? 0) || null;
  const holdSeconds = Number(formData.get("holdSeconds") ?? 0) || null;

  const byId = new Map(libraryExercises.map((e) => [e.id, e]));
  const rows = exerciseIds.flatMap((id, index) => {
    const exercise = byId.get(id);
    if (!exercise) return [];
    return [
      {
        programme_id: data.id,
        exercise_id: exercise.id,
        name: exercise.name,
        media_url: exercise.media_url,
        sets,
        reps,
        hold_seconds: holdSeconds,
        sort_order: index,
      },
    ];
  });

  if (!rows.length) {
    await supabase.from("exercise_programmes").delete().eq("id", data.id);
    return { error: "Could not build programme exercises" };
  }

  const { error: insertError } = await supabase.from("programme_exercises").insert(rows);
  if (insertError) {
    await supabase.from("exercise_programmes").delete().eq("id", data.id);
    return { error: insertError.message };
  }

  revalidatePath("/admin/programmes");
  revalidatePath("/portal/programmes");
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
