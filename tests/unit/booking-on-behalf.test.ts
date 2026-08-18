import { describe, expect, it } from "vitest";

import {
  resolveBookingPatient,
  shouldInvitePatientPortal,
} from "@/features/booking/lib/booking-on-behalf";

const son = "son-profile";
const mumId = "mum-id";
const selfId = "self-id";

describe("booking on behalf", () => {
  it("books the viewer's own patient and attaches their profile", () => {
    const result = resolveBookingPatient({
      requestedPatientId: selfId,
      sessionProfileId: son,
      ownedPatientId: selfId,
      linkedContacts: [],
    });
    expect(result).toEqual({ patientId: selfId, attachProfile: true });
    expect(shouldInvitePatientPortal(true)).toBe(true);
  });

  it("books a linked parent without attaching the son's profile", () => {
    const result = resolveBookingPatient({
      requestedPatientId: mumId,
      sessionProfileId: son,
      ownedPatientId: selfId,
      linkedContacts: [{ patientId: mumId, canBook: true }],
    });
    expect(result).toEqual({ patientId: mumId, attachProfile: false });
    expect(shouldInvitePatientPortal(false)).toBe(false);
  });

  it("rejects booking a patient that is not linked", () => {
    const result = resolveBookingPatient({
      requestedPatientId: mumId,
      sessionProfileId: son,
      ownedPatientId: selfId,
      linkedContacts: [],
    });
    expect(result.error).toMatch(/linked/i);
  });

  it("rejects contacts who cannot book", () => {
    const result = resolveBookingPatient({
      requestedPatientId: mumId,
      sessionProfileId: son,
      ownedPatientId: null,
      linkedContacts: [{ patientId: mumId, canBook: false }],
    });
    expect(result.error).toMatch(/permission/i);
  });

  it("requires a patient picker when more than one bookable family member exists", () => {
    const result = resolveBookingPatient({
      sessionProfileId: son,
      ownedPatientId: null,
      linkedContacts: [
        { patientId: mumId, canBook: true },
        { patientId: "dad-id", canBook: true },
      ],
    });
    expect(result.error).toMatch(/choose who/i);
  });
});
