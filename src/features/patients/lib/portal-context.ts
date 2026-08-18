import { cookies } from "next/headers";

export const PORTAL_PATIENT_COOKIE = "portal_patient_id";

export async function getSelectedPortalPatientId() {
  const store = await cookies();
  const value = store.get(PORTAL_PATIENT_COOKIE)?.value?.trim();
  return value || null;
}

export function pickPortalPatient<T extends { id: string }>(
  patients: T[],
  selectedId: string | null,
): T | null {
  if (!patients.length) return null;
  return patients.find((patient) => patient.id === selectedId) ?? patients[0] ?? null;
}
