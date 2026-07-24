"use server";

import { revalidatePath } from "next/cache";

import { createPatient, updatePatient } from "@/features/patients/api/patients";
import {
  createPatientSchema,
  updatePatientSchema,
} from "@/features/patients/schemas/patient";
import { routes } from "@/config/routes";

export type PatientActionState = { error?: string; success?: string; id?: string };

export async function createPatientAction(
  _prev: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const parsed = createPatientSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    dateOfBirth: formData.get("dateOfBirth") || "",
    medicalAidName: formData.get("medicalAidName") || "",
    medicalAidNumber: formData.get("medicalAidNumber") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid patient data" };
  }

  const { data, error } = await createPatient(parsed.data);
  if (error || !data) return { error: error?.message ?? "Failed to create patient" };

  revalidatePath(routes.admin.patients);
  return { success: "Patient created", id: data.id };
}

export async function updatePatientAction(
  _prev: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const parsed = updatePatientSchema.safeParse({
    id: formData.get("id"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    dateOfBirth: formData.get("dateOfBirth") || "",
    medicalAidName: formData.get("medicalAidName") || "",
    medicalAidNumber: formData.get("medicalAidNumber") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid patient data" };
  }

  const { error } = await updatePatient(parsed.data);
  if (error) return { error: error.message };

  revalidatePath(routes.admin.patients);
  revalidatePath(routes.admin.patient(parsed.data.id));
  return { success: "Patient updated", id: parsed.data.id };
}
