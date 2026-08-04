export type SignedConsentSignature = {
  formId: string;
  formTitle: string;
  formSlug: string;
  formBody: string;
  signedAt: string;
  typedName: string | null;
  padDataUrl: string | null;
};

export type SignedConsentPackage = {
  patientId: string;
  patientName: string;
  intake: {
    formTitle: string;
    submittedAt: string;
    answers: Record<string, unknown>;
  } | null;
  signatures: SignedConsentSignature[];
};

/** Friendly labels for common intake answer keys. */
export const INTAKE_ANSWER_LABELS: Record<string, string> = {
  fullName: "Full name",
  email: "Email",
  phone: "Phone",
  dateOfBirth: "Date of birth",
  medicalAid: "Medical aid",
  medicalAidNumber: "Medical aid number",
  undertaking: "Undertaking",
  emergencyContact: "Emergency contact",
  emergencyPhone: "Emergency phone",
  pleaseNote: "Please note",
  howDidYouHear: "How did you hear about us",
  releaseTo: "Release information to",
};
