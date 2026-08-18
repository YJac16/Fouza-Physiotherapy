import { describe, expect, it } from "vitest";

import {
  buildSignaturePayload,
  portalConsentPatientUpdate,
  portalInviteFromAccountPayer,
  portalInviteFromConsentAnswers,
  portalInviteLinksPatientProfile,
  splitFullName,
  staffConsentPatientUpdate,
} from "@/features/consent-forms/lib/staff-capture";

describe("staff consent capture flags", () => {
  it("marks consent complete without requiring a patient login", () => {
    const signedAt = "2026-08-18T12:00:00.000Z";
    expect(
      staffConsentPatientUpdate({
        staffProfileId: "staff-id",
        signedAt,
        versionLabel: "treatment-consent:v1+account-responsibility:v1",
      }),
    ).toEqual({
      informed_consent_signed: true,
      informed_consent_signed_at: signedAt,
      informed_consent_version: "treatment-consent:v1+account-responsibility:v1",
      verified_account: true,
      consent_capture_method: "staff_assisted",
      consent_captured_by: "staff-id",
    });
  });

  it("records portal self-serve consent separately from staff capture", () => {
    const signedAt = "2026-08-18T12:00:00.000Z";
    expect(portalConsentPatientUpdate({ signedAt, versionLabel: null })).toMatchObject({
      informed_consent_signed: true,
      consent_capture_method: "portal",
    });
  });

  it("stores signer role on the signature payload", () => {
    const payload = JSON.parse(
      buildSignaturePayload({
        typedName: "Amina Khan",
        pad: "data:image/png;base64,abc",
        role: "patient",
      }),
    );
    expect(payload.role).toBe("patient");
    expect(payload.typedName).toBe("Amina Khan");
  });
});

describe("payer-to-portal routing", () => {
  it("invites the patient portal when the payer is the patient", () => {
    const plan = portalInviteFromConsentAnswers({
      fullName: "Amina Khan",
      email: "amina@example.com",
      accountResponsible: {
        sameAsPatient: true,
        name: "Amina Khan",
        email: "amina@example.com",
      },
    });
    expect(plan).toEqual({
      kind: "patient",
      email: "amina@example.com",
      fullName: "Amina Khan",
    });
    expect(portalInviteLinksPatientProfile(plan)).toBe(true);
  });

  it("invites the family portal when the payer is someone else", () => {
    const plan = portalInviteFromConsentAnswers({
      fullName: "Fatima Khan",
      email: "fatima@example.com",
      accountResponsible: {
        sameAsPatient: false,
        name: "Amina Khan",
        email: "amina@example.com",
      },
    });
    expect(plan).toEqual({
      kind: "family",
      email: "amina@example.com",
      fullName: "Amina Khan",
    });
    expect(portalInviteLinksPatientProfile(plan)).toBe(false);
  });

  it("does not invite when the required portal email is missing", () => {
    expect(
      portalInviteFromAccountPayer({
        sameAsPatient: true,
        patientFullName: "Amina Khan",
        patientEmail: "",
      }),
    ).toEqual({ kind: "none" });
    expect(
      portalInviteFromAccountPayer({
        sameAsPatient: false,
        patientFullName: "Fatima Khan",
        patientEmail: "fatima@example.com",
        payerName: "Amina Khan",
        payerEmail: "  ",
      }),
    ).toEqual({ kind: "none" });
  });

  it("splits a signup full name into first and last names", () => {
    expect(splitFullName("Amina Khan")).toEqual({ firstName: "Amina", lastName: "Khan" });
    expect(splitFullName("Amina")).toEqual({ firstName: "Amina", lastName: "Amina" });
  });
});
