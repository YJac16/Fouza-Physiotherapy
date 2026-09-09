import { describe, expect, it } from "vitest";

import {
  applyLetterPlaceholders,
  ageFromDateOfBirth,
  buildLetterPlaceholderValues,
  formatLetterDate,
  pronounsFromSex,
} from "@/features/clinical-letters/lib/placeholders";
import { letterPrintBasename, letterPrintFilename } from "@/features/clinical-letters/lib/print";
import {
  canEditLetter,
  canPrintLetter,
  canSendLetter,
  canSignLetter,
} from "@/features/clinical-letters/lib/status";
import { canAuthorClinicalLetters } from "@/features/clinical-letters/lib/auth";
import { renderEmailTemplate } from "@/features/notifications/lib/email-templates";

describe("letter placeholders", () => {
  it("substitutes known keys and blanks unknown ones", () => {
    expect(applyLetterPlaceholders("Hello {{patientName}} {{missing}}.", { patientName: "Ada" })).toBe(
      "Hello Ada .",
    );
  });

  it("formats dates like 09 September 2026", () => {
    expect(formatLetterDate("2026-09-09")).toBe("09 September 2026");
  });

  it("computes age from date of birth", () => {
    expect(ageFromDateOfBirth("1971-01-15", "2026-09-09")).toBe("55");
  });

  it("maps sex to pronouns", () => {
    expect(pronounsFromSex("female").pronounPossessive).toBe("her");
    expect(pronounsFromSex("male").pronounSubjectCap).toBe("He");
    expect(pronounsFromSex("").pronounSubject).toBe("they");
  });

  it("builds a proof-of-attendance body from the default template shape", () => {
    const values = buildLetterPlaceholderValues({
      patientName: "Jane Patient",
      practiceName: "Fouza Physiotherapy",
      letterDate: "2026-09-09",
      attendanceDate: "2026-09-09",
      patientAge: "55",
      patientSex: "female",
      presentingComplaint: "an acute flare-up of sciatica",
      findings: "pain and an antalgic gait",
      recommendations: "modify activities for 48 hours",
    });
    const body = applyLetterPlaceholders(
      "This is to certify that the above-mentioned patient attended {{practiceName}} on {{attendanceDate}}, presenting with {{presentingComplaint}}. {{pronounSubjectCap}} presented with {{findings}}.",
      values,
    );
    expect(body).toContain("Fouza Physiotherapy");
    expect(body).toContain("09 September 2026");
    expect(body).toContain("She presented with pain and an antalgic gait");
  });
});

describe("letter status", () => {
  it("blocks edit and sign after signing", () => {
    expect(canEditLetter("draft")).toBe(true);
    expect(canSignLetter("draft")).toBe(true);
    expect(canSendLetter("draft")).toBe(false);
    expect(canPrintLetter("draft")).toBe(false);

    expect(canEditLetter("signed")).toBe(false);
    expect(canSignLetter("signed")).toBe(false);
    expect(canSendLetter("signed")).toBe(true);
    expect(canPrintLetter("signed")).toBe(true);

    expect(canEditLetter("sent")).toBe(false);
    expect(canSendLetter("sent")).toBe(true);
    expect(canPrintLetter("sent")).toBe(true);
  });
});

describe("letter authorship", () => {
  it("allows admin and practitioner only", () => {
    expect(canAuthorClinicalLetters("admin")).toBe(true);
    expect(canAuthorClinicalLetters("practitioner")).toBe(true);
    expect(canAuthorClinicalLetters("receptionist")).toBe(false);
    expect(canAuthorClinicalLetters("patient")).toBe(false);
  });
});

describe("letter print names", () => {
  it("includes type, patient, and date", () => {
    expect(letterPrintBasename("proof_of_attendance", "Jane Patient", "2026-09-09")).toBe(
      "Proof-of-Attendance_Jane-Patient_2026-09-09",
    );
    expect(letterPrintFilename("medical_referral", "Jane Patient", "2026-09-09")).toBe(
      "Medical-Referral_Jane-Patient_2026-09-09.pdf",
    );
  });
});

describe("letter emails", () => {
  const payload = {
    letterId: "letter-1",
    letterTitle: "REFERRAL FOR MEDICAL ASSESSMENT",
    firstName: "Jane",
    patientName: "Jane Patient",
    body: "I am referring the patient for further assessment.",
  };

  it("renders a patient send with a portal link", () => {
    const result = renderEmailTemplate("letter.sent", payload);
    expect(result.subject).toContain("REFERRAL FOR MEDICAL ASSESSMENT");
    expect(result.html).toContain("patient portal");
    expect(result.html).toContain("/portal/letters/letter-1");
    expect(result.html).not.toContain("I am referring the patient");
  });

  it("renders a recipient copy with the letter body", () => {
    const result = renderEmailTemplate("letter.sent.copy", payload);
    expect(result.subject).toContain("Jane Patient");
    expect(result.html).toContain("I am referring the patient for further assessment.");
  });
});
