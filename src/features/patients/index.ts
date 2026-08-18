/**
 * Patients feature — patient records and practice CRM.
 */
export const PATIENTS_FEATURE = "patients" as const;

export * from "./schemas/patient";
export * from "./api/patients";
export * from "./actions/patients";
export { CreatePatientForm, EditPatientForm } from "./components/create-patient-form";
export { DeletePatientForm } from "./components/delete-patient-form";
export { PatientClinicalRecords } from "./components/patient-clinical-records";
export type { AccessiblePatient } from "./lib/access";
