import type { ClinicalLetterStatus } from "@/features/clinical-letters/types/letter";

export function canEditLetter(status: ClinicalLetterStatus) {
  return status === "draft";
}

export function canSignLetter(status: ClinicalLetterStatus) {
  return status === "draft";
}

export function canSendLetter(status: ClinicalLetterStatus) {
  return status === "signed" || status === "sent";
}

export function canPrintLetter(status: ClinicalLetterStatus) {
  return status === "signed" || status === "sent";
}

export function assertCanEdit(status: ClinicalLetterStatus) {
  if (!canEditLetter(status)) {
    throw new Error("Signed letters cannot be edited. Create a new letter instead.");
  }
}

export function assertCanSign(status: ClinicalLetterStatus) {
  if (!canSignLetter(status)) {
    throw new Error("This letter is already signed.");
  }
}

export function assertCanSend(status: ClinicalLetterStatus) {
  if (!canSendLetter(status)) {
    throw new Error("Sign the letter before sending it.");
  }
}

export function assertCanPrint(status: ClinicalLetterStatus) {
  if (!canPrintLetter(status)) {
    throw new Error("Sign the letter before downloading it.");
  }
}
