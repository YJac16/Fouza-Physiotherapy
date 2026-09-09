import type { AppRole } from "@/types/auth";
import { LETTER_AUTHOR_ROLES } from "@/features/clinical-letters/types/letter";

export function canAuthorClinicalLetters(role: AppRole) {
  return (LETTER_AUTHOR_ROLES as readonly string[]).includes(role);
}
