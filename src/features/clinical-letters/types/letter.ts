export type ClinicalLetterType = "proof_of_attendance" | "medical_referral";
export type ClinicalLetterStatus = "draft" | "signed" | "sent";

export const LETTER_AUTHOR_ROLES = ["admin", "practitioner"] as const;

export const LETTER_TYPE_LABELS: Record<ClinicalLetterType, string> = {
  proof_of_attendance: "Proof of attendance",
  medical_referral: "Referral for medical assessment",
};

export const LETTER_STATUS_LABELS: Record<ClinicalLetterStatus, string> = {
  draft: "Draft",
  signed: "Signed",
  sent: "Sent",
};

export function letterTypeLabel(type: string) {
  return type === "medical_referral"
    ? LETTER_TYPE_LABELS.medical_referral
    : LETTER_TYPE_LABELS.proof_of_attendance;
}

export function letterStatusLabel(status: string) {
  if (status === "signed") return LETTER_STATUS_LABELS.signed;
  if (status === "sent") return LETTER_STATUS_LABELS.sent;
  return LETTER_STATUS_LABELS.draft;
}

export const DEFAULT_LETTER_TITLES: Record<ClinicalLetterType, string> = {
  proof_of_attendance: "PROOF OF ATTENDANCE / PHYSIOTHERAPY RECOMMENDATION",
  medical_referral: "REFERRAL FOR MEDICAL ASSESSMENT",
};
