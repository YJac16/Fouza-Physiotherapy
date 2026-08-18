import { describe, expect, it } from "vitest";

import { isGaConfigured, sanitizeAnalyticsParams } from "@/lib/analytics/gtag";

describe("GA4 privacy sanitizer", () => {
  it("strips patient and clinical identifiers", () => {
    expect(
      sanitizeAnalyticsParams({
        method: "book",
        email: "patient@example.com",
        phone: "+27645136210",
        name: "Ada",
        appointment_id: "uuid",
        patient_id: "uuid",
        notes: "back pain",
        location: "header",
      }),
    ).toEqual({
      method: "book",
      location: "header",
    });
  });

  it("does not treat a blank measurement id as configured", () => {
    expect(isGaConfigured()).toBe(false);
  });
});
