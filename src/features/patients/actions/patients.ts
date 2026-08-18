"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { createPatient, searchPatients, updatePatient } from "@/features/patients/api/patients";
import {
  createPatientSchema,
  updatePatientSchema,
} from "@/features/patients/schemas/patient";
import { PORTAL_PATIENT_COOKIE } from "@/features/patients/lib/portal-context";
import { listAccessiblePatients } from "@/features/patients/api/patients";
import { routes } from "@/config/routes";

export type PatientActionState = { error?: string; success?: string; id?: string };

function patientFormValues(formData: FormData) {
  return {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    dateOfBirth: formData.get("dateOfBirth") || "",
    medicalAidName: formData.get("medicalAidName") || "",
    medicalAidNumber: formData.get("medicalAidNumber") || "",
    medicalAidDependantCode: formData.get("medicalAidDependantCode") || "",
    idNumber: formData.get("idNumber") || "",
    postalAddress: formData.get("postalAddress") || "",
    notes: formData.get("notes") || "",
    billingName: formData.get("billingName") || "",
    billingEmail: formData.get("billingEmail") || "",
    billingPhone: formData.get("billingPhone") || "",
    billingAddress: formData.get("billingAddress") || "",
    accountHolderRelationship: formData.get("accountHolderRelationship") || "",
    inviteAccountHolder:
      formData.get("inviteAccountHolder") === "on" ||
      formData.get("inviteAccountHolder") === "true",
  };
}

export async function searchPatientsAction(query?: string) {
  const { data, error } = await searchPatients(query);
  if (error) return { patients: [], error: error.message };
  return {
    patients: (data ?? []).map((p) => ({
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      email: p.email,
      phone: p.phone,
      verifiedAccount: Boolean(p.verified_account),
      informedConsentSigned: Boolean(p.informed_consent_signed),
      label: `${p.first_name} ${p.last_name}`.trim(),
      description: [p.email, p.phone, p.billing_email].filter(Boolean).join(" · ") || undefined,
    })),
  };
}

export async function createPatientAction(
  _prev: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const parsed = createPatientSchema.safeParse(patientFormValues(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid patient data" };
  }

  const { data, error, invited } = await createPatient(parsed.data);
  if (error || !data) return { error: error?.message ?? "Failed to create patient" };

  revalidatePath(routes.admin.patients);
  return {
    success: invited
      ? "Patient created and account holder invited to the portal"
      : "Patient created",
    id: data.id,
  };
}

export async function updatePatientAction(
  _prev: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const parsed = updatePatientSchema.safeParse({
    id: formData.get("id"),
    ...patientFormValues(formData),
  });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid patient data" };
  }

  const { error, invited } = await updatePatient(parsed.data);
  if (error) return { error: error.message };

  revalidatePath(routes.admin.patients);
  revalidatePath(routes.admin.patient(parsed.data.id));
  return {
    success: invited ? "Patient updated and portal invite sent" : "Patient updated",
    id: parsed.data.id,
  };
}

export async function setSelectedPortalPatientAction(patientId: string) {
  const { data } = await listAccessiblePatients();
  if (!data.some((patient) => patient.id === patientId)) {
    return { error: "Patient is not linked to this account" };
  }
  const store = await cookies();
  store.set(PORTAL_PATIENT_COOKIE, patientId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/portal");
  revalidatePath("/book");
  return { error: null as string | null };
}
