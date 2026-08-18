export type PatientAccessKind = "self" | "contact";

export type OwnedPatientRow = {
  id: string;
  profileId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  verifiedAccount: boolean;
  informedConsentSigned: boolean;
};

export type ContactAccessRow = {
  patientId: string;
  profileId: string | null;
  canViewPortal: boolean;
  canBook: boolean;
  isAccountHolder: boolean;
};

export type AccessiblePatient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  verifiedAccount: boolean;
  informedConsentSigned: boolean;
  access: PatientAccessKind;
  canBook: boolean;
  canViewPortal: boolean;
  isAccountHolder: boolean;
};

/**
 * Merge patients the viewer owns (profile_id) with patients they manage as a contact.
 * Own records win if the same id appears twice. Strangers get an empty list.
 */
export function resolveAccessiblePatients(
  viewerProfileId: string,
  ownedPatients: OwnedPatientRow[],
  contactPatients: Array<OwnedPatientRow & ContactAccessRow>,
): AccessiblePatient[] {
  const byId = new Map<string, AccessiblePatient>();

  for (const patient of ownedPatients) {
    if (patient.profileId !== viewerProfileId) continue;
    byId.set(patient.id, {
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      verifiedAccount: patient.verifiedAccount,
      informedConsentSigned: patient.informedConsentSigned,
      access: "self",
      canBook: true,
      canViewPortal: true,
      isAccountHolder: false,
    });
  }

  for (const contact of contactPatients) {
    if (contact.profileId !== viewerProfileId) continue;
    if (!contact.canViewPortal) continue;
    const existing = byId.get(contact.patientId);
    if (existing) {
      existing.canBook = existing.canBook || contact.canBook;
      existing.isAccountHolder = existing.isAccountHolder || contact.isAccountHolder;
      continue;
    }
    byId.set(contact.patientId, {
      id: contact.patientId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      verifiedAccount: contact.verifiedAccount,
      informedConsentSigned: contact.informedConsentSigned,
      access: "contact",
      canBook: contact.canBook,
      canViewPortal: true,
      isAccountHolder: contact.isAccountHolder,
    });
  }

  return [...byId.values()].sort((a, b) =>
    `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`),
  );
}

export function canAccessPatient(
  patients: AccessiblePatient[],
  patientId: string,
): AccessiblePatient | null {
  return patients.find((patient) => patient.id === patientId) ?? null;
}

export function patientDisplayName(patient: { firstName: string; lastName: string }) {
  return `${patient.firstName} ${patient.lastName}`.trim();
}
