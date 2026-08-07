/** Service slugs bookable without verified + consent. */
export const NEW_PATIENT_SERVICE_SLUGS = [
  "initial-consultation",
  "injury-prevention",
] as const;

/** Service slugs that require verified_account + informed_consent_signed. */
export const VERIFIED_ONLY_SERVICE_SLUGS = [
  "follow-up-consultation",
  "double-follow-up",
] as const;

export type BookingPatientContext = {
  patientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  verifiedAccount: boolean;
  informedConsentSigned: boolean;
  needsConsent: boolean;
  canBookFollowUps: boolean;
};

export function canBookFollowUpServices(patient: {
  verified_account: boolean;
  informed_consent_signed: boolean;
}) {
  return Boolean(patient.verified_account && patient.informed_consent_signed);
}

export function isFollowUpServiceSlug(slug: string) {
  return (VERIFIED_ONLY_SERVICE_SLUGS as readonly string[]).includes(slug);
}

export function filterBookableServices<T extends { slug: string }>(
  services: T[],
  canBookFollowUps: boolean,
): T[] {
  if (canBookFollowUps) return services;
  return services.filter((s) =>
    (NEW_PATIENT_SERVICE_SLUGS as readonly string[]).includes(s.slug),
  );
}

export function buildConsentVersionLabel(
  forms: Array<{ slug: string; version: number }>,
) {
  return forms
    .slice()
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((f) => `${f.slug}:v${f.version}`)
    .join("+");
}
