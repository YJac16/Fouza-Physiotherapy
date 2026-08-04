/**
 * Patients feature — patient records and practice CRM.
 */
export const PATIENTS_FEATURE = "patients" as const;

export * from "./schemas/patient";
export * from "./api/patients";
export * from "./actions/patients";
export { CreatePatientForm } from "./components/create-patient-form";
export { PatientClinicalRecords } from "./components/patient-clinical-records";
