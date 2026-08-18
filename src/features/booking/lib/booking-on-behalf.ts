export type BookingContact = {
  patientId: string;
  canBook: boolean;
};

export type ResolveBookingPatientInput = {
  requestedPatientId?: string | null;
  sessionProfileId?: string | null;
  ownedPatientId?: string | null;
  linkedContacts: BookingContact[];
};

export type ResolveBookingPatientResult =
  | { patientId: string; attachProfile: boolean; error?: undefined }
  | { patientId?: undefined; attachProfile?: undefined; error: string };

/**
 * Decide which patient an online booking belongs to.
 * Linked contacts may book on behalf of a parent; that must never attach the
 * booker's profile_id onto the patient's file.
 */
export function resolveBookingPatient(
  input: ResolveBookingPatientInput,
): ResolveBookingPatientResult {
  const requested = input.requestedPatientId?.trim() || null;

  if (requested) {
    if (!input.sessionProfileId) {
      return { error: "Sign in to book for a family member." };
    }
    if (input.ownedPatientId === requested) {
      return { patientId: requested, attachProfile: true };
    }
    const contact = input.linkedContacts.find((row) => row.patientId === requested);
    if (!contact) {
      return { error: "You can only book for patients linked to your account." };
    }
    if (!contact.canBook) {
      return { error: "You do not have permission to book for this patient." };
    }
    return { patientId: requested, attachProfile: false };
  }

  if (input.ownedPatientId) {
    return { patientId: input.ownedPatientId, attachProfile: true };
  }

  const bookable = input.linkedContacts.filter((row) => row.canBook);
  const onlyBookable = bookable[0];
  if (bookable.length === 1 && onlyBookable) {
    return { patientId: onlyBookable.patientId, attachProfile: false };
  }
  if (bookable.length > 1) {
    return { error: "Choose who this appointment is for." };
  }

  return { error: "No patient record is linked to this booking." };
}

export function shouldInvitePatientPortal(attachProfile: boolean) {
  return attachProfile;
}
