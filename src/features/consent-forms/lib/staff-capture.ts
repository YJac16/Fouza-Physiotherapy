export type ConsentCaptureMethod = "portal" | "staff_assisted";
export type ConsentSignerRole = "patient" | "account_holder" | "proxy";

export type AccountResponsible = {
  sameAsPatient?: boolean;
  name?: string;
  email?: string;
  contactNumber?: string;
  postalAddress?: string;
};

export type PortalInviteKind = "patient" | "family" | "none";

export type PortalInvitePlan =
  | { kind: "patient"; email: string; fullName: string }
  | { kind: "family"; email: string; fullName: string }
  | { kind: "none" };

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0] ?? "", lastName: parts[0] ?? "" };
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

export function parseAccountResponsible(answers: Record<string, unknown>): AccountResponsible {
  const raw = answers.accountResponsible;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { sameAsPatient: true };
  }
  const value = raw as Record<string, unknown>;
  return {
    sameAsPatient: value.sameAsPatient === true,
    name: typeof value.name === "string" ? value.name : undefined,
    email: typeof value.email === "string" ? value.email : undefined,
    contactNumber: typeof value.contactNumber === "string" ? value.contactNumber : undefined,
    postalAddress: typeof value.postalAddress === "string" ? value.postalAddress : undefined,
  };
}

export function joinPostalAddress(answers: Record<string, unknown>) {
  return [answers.street, answers.suburb, answers.areaCode]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

/**
 * Same payer → patient portal. Different payer → family portal.
 * Skip invite when the required email (and family name) is missing.
 */
export function portalInviteFromAccountPayer(input: {
  sameAsPatient: boolean;
  patientFullName: string;
  patientEmail?: string | null;
  payerName?: string | null;
  payerEmail?: string | null;
}): PortalInvitePlan {
  if (input.sameAsPatient) {
    const email = input.patientEmail?.trim().toLowerCase() ?? "";
    const fullName = input.patientFullName.trim();
    if (!email || !fullName) return { kind: "none" };
    return { kind: "patient", email, fullName };
  }

  const email = input.payerEmail?.trim().toLowerCase() ?? "";
  const fullName = input.payerName?.trim() ?? "";
  if (!email || !fullName) return { kind: "none" };
  return { kind: "family", email, fullName };
}

export function portalInviteFromConsentAnswers(answers: Record<string, unknown>): PortalInvitePlan {
  const responsible = parseAccountResponsible(answers);
  return portalInviteFromAccountPayer({
    sameAsPatient: responsible.sameAsPatient === true,
    patientFullName: String(answers.fullName ?? ""),
    patientEmail: String(answers.email ?? ""),
    payerName: responsible.name,
    payerEmail: responsible.email,
  });
}

/** Family portal links patient_contacts.profile_id only — never patients.profile_id. */
export function portalInviteLinksPatientProfile(plan: PortalInvitePlan): boolean {
  return plan.kind === "patient";
}

export function staffConsentPatientUpdate(input: {
  staffProfileId: string;
  signedAt: string;
  versionLabel: string | null;
}) {
  return {
    informed_consent_signed: true,
    informed_consent_signed_at: input.signedAt,
    informed_consent_version: input.versionLabel,
    verified_account: true,
    consent_capture_method: "staff_assisted" as const,
    consent_captured_by: input.staffProfileId,
  };
}

export function portalConsentPatientUpdate(input: {
  signedAt: string;
  versionLabel: string | null;
}) {
  return {
    informed_consent_signed: true,
    informed_consent_signed_at: input.signedAt,
    informed_consent_version: input.versionLabel,
    verified_account: true,
    consent_capture_method: "portal" as const,
  };
}

export function buildSignaturePayload(input: {
  typedName: string;
  pad: string;
  role: ConsentSignerRole;
}) {
  return JSON.stringify({
    typedName: input.typedName,
    pad: input.pad,
    role: input.role,
  });
}

export function resolveStaffAccountTypedName(input: {
  accountTypedName?: string;
  answers: Record<string, unknown>;
  existingAccountPayerName?: string;
  treatmentTypedName: string;
}): string {
  return (
    input.accountTypedName?.trim() ||
    input.existingAccountPayerName?.trim() ||
    String(parseAccountResponsible(input.answers).name ?? input.treatmentTypedName).trim()
  );
}

export function shouldPreserveExistingBilling(input: {
  preserveExistingBilling: boolean;
  created: boolean;
  existingBillingName: string | null | undefined;
}): boolean {
  return (
    input.preserveExistingBilling &&
    !input.created &&
    Boolean(input.existingBillingName?.trim())
  );
}

export function buildAccountResponsibleFromPayer(payer: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}): AccountResponsible {
  return {
    sameAsPatient: false,
    name: payer.name,
    email: payer.email,
    contactNumber: payer.phone,
    postalAddress: payer.address,
  };
}
