import { describe, expect, it } from "vitest";

import {
  canBookFollowUpServices,
  filterBookableServices,
  isFollowUpServiceSlug,
} from "@/features/booking/lib/eligibility";

describe("booking eligibility", () => {
  it("allows follow-ups only when verified and consent signed", () => {
    expect(
      canBookFollowUpServices({
        verified_account: true,
        informed_consent_signed: true,
      }),
    ).toBe(true);
    expect(
      canBookFollowUpServices({
        verified_account: true,
        informed_consent_signed: false,
      }),
    ).toBe(false);
    expect(
      canBookFollowUpServices({
        verified_account: false,
        informed_consent_signed: true,
      }),
    ).toBe(false);
  });

  it("filters services for new patients", () => {
    const services = [
      { slug: "initial-consultation" },
      { slug: "follow-up-consultation" },
      { slug: "double-follow-up" },
      { slug: "injury-prevention" },
    ];
    expect(filterBookableServices(services, false).map((s) => s.slug)).toEqual([
      "initial-consultation",
      "injury-prevention",
    ]);
    expect(filterBookableServices(services, true)).toHaveLength(4);
  });

  it("detects follow-up slugs", () => {
    expect(isFollowUpServiceSlug("follow-up-consultation")).toBe(true);
    expect(isFollowUpServiceSlug("initial-consultation")).toBe(false);
  });
});
