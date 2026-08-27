import { describe, expect, it } from "vitest";

import { buildConsentSignatureRows } from "@/features/consent-forms/lib/consent-snapshots";
import { cancellationPolicyNotice, cancellationPolicyUndertaking } from "@/content/pricing";
import { pricingNotices } from "@/content/pricing";

describe("buildConsentSignatureRows", () => {
  it("stores form version and body snapshot at sign time", () => {
    const rows = buildConsentSignatureRows({
      patientId: "patient-1",
      forms: [
        {
          id: "form-1",
          slug: "treatment-consent",
          version: 3,
          body_md: "Treatment body v3",
        },
        {
          id: "form-2",
          slug: "account-responsibility",
          version: 4,
          body_md: "Account body v4",
        },
      ],
      signatures: [
        { formId: "form-1", signatureData: "sig-1" },
        { formId: "form-2", signatureData: "sig-2" },
      ],
      signedAt: "2026-08-26T12:00:00.000Z",
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      form_id: "form-1",
      patient_id: "patient-1",
      form_version: 3,
      body_md_snapshot: "Treatment body v3",
      ip_address: "127.0.0.1",
      user_agent: "test-agent",
    });
  });
});

describe("cancellation policy copy", () => {
  it("uses consistent 6 hour / 50% wording", () => {
    expect(pricingNotices.cancellation).toContain("6 hours");
    expect(pricingNotices.cancellation).toContain("50%");
    expect(cancellationPolicyNotice).toBe(pricingNotices.cancellation);
    expect(cancellationPolicyUndertaking).toContain("6 hours");
    expect(cancellationPolicyUndertaking).toContain("50%");
  });
});
