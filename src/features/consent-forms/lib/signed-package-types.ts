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
  idNumber: "ID number",
  contactNumber: "Contact number",
  email: "Email",
  phone: "Phone",
  street: "Street",
  suburb: "Suburb",
  areaCode: "Area code",
  dateOfBirth: "Date of birth",
  medicalAid: "Medical aid",
  medicalAidNumber: "Medical aid number",
  dependantCode: "Dependant code",
  accountResponsible: "Person responsible for account",
  releaseInformation: "Release information to",
  releaseOther: "Release information (other)",
  referralSources: "How did you find out about this practice?",
  sourceOther: "Referral source (other)",
  undertaking: "Undertaking",
  pleaseNote: "Please note",
  typedFullName: "Typed full name",
  emergencyContact: "Emergency contact",
  emergencyPhone: "Emergency phone",
  howDidYouHear: "How did you hear about us",
  releaseTo: "Release information to",
};

const ACCOUNT_RESPONSIBLE_FIELD_LABELS: Record<string, string> = {
  sameAsPatient: "Same as patient",
  name: "Name",
  idNumber: "ID number",
  contactNumber: "Contact number",
  email: "Email",
  postalAddress: "Postal address",
};

function formatScalar(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

/** Format nested accountResponsible objects without leaking JSON braces/booleans. */
export function formatAccountResponsible(value: Record<string, unknown>): string {
  const lines: string[] = [];
  const sameAs = value.sameAsPatient === true;
  lines.push(`Same as patient: ${sameAs ? "Yes" : "No"}`);

  for (const key of ["name", "idNumber", "contactNumber", "email", "postalAddress"] as const) {
    const raw = value[key];
    if (raw == null || raw === "") continue;
    const label = ACCOUNT_RESPONSIBLE_FIELD_LABELS[key] ?? key;
    lines.push(`${label}: ${String(raw)}`);
  }

  return lines.join("\n");
}

export function formatIntakeAnswerValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "yes" || normalized === "agree") return "Yes";
    if (normalized === "no" || normalized === "disagree") return "No";
    return value;
  }
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const parts = value.map((item) => formatScalar(item)).filter((v) => v && v !== "—");
    return parts.length ? parts.join(", ") : "—";
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if ("sameAsPatient" in obj || ("name" in obj && "postalAddress" in obj)) {
      return formatAccountResponsible(obj);
    }
    const lines = Object.entries(obj)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => {
        const label = ACCOUNT_RESPONSIBLE_FIELD_LABELS[k] ?? INTAKE_ANSWER_LABELS[k] ?? k;
        return `${label}: ${formatIntakeAnswerValue(v)}`;
      });
    return lines.length ? lines.join("\n") : "—";
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "—";
  }
}
