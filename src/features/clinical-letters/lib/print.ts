import { invoicePatientSlug } from "@/features/billing/lib/invoice-print";
import {
  DEFAULT_LETTER_TITLES,
  type ClinicalLetterType,
} from "@/features/clinical-letters/types/letter";

export function letterPrintBasename(
  letterType: ClinicalLetterType,
  patientName?: string | null,
  letterDate?: string | null,
) {
  const kind =
    letterType === "medical_referral" ? "Medical-Referral" : "Proof-of-Attendance";
  const slug = invoicePatientSlug(patientName);
  const date = (letterDate ?? "").slice(0, 10);
  return [kind, slug, date].filter(Boolean).join("_");
}

export function letterPrintFilename(
  letterType: ClinicalLetterType,
  patientName?: string | null,
  letterDate?: string | null,
) {
  return `${letterPrintBasename(letterType, patientName, letterDate)}.pdf`;
}

export function letterPrintDocumentTitle(
  letterType: ClinicalLetterType,
  patientName?: string | null,
  letterDate?: string | null,
) {
  return letterPrintBasename(letterType, patientName, letterDate);
}

export function letterHeading(letterType: ClinicalLetterType, subjectLine?: string | null) {
  const custom = subjectLine?.trim();
  return custom || DEFAULT_LETTER_TITLES[letterType];
}
