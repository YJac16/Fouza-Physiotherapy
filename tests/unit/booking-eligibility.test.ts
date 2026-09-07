import { describe, expect, it } from "vitest";

import {
  canBookFollowUpServices,
  filterBookableServices,
  isFollowUpServiceSlug,
  isRetiredServiceSlug,
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
    ];
    expect(filterBookableServices(services, false).map((s) => s.slug)).toEqual([
      "initial-consultation",
    ]);
    expect(filterBookableServices(services, true)).toHaveLength(3);
  });

  it("detects follow-up slugs", () => {
    expect(isFollowUpServiceSlug("follow-up-consultation")).toBe(true);
    expect(isFollowUpServiceSlug("initial-consultation")).toBe(false);
  });

  it("excludes retired services from all catalogues", () => {
    expect(isRetiredServiceSlug("injury-prevention")).toBe(true);
    const services = [
      { slug: "initial-consultation" },
      { slug: "injury-prevention" },
      { slug: "follow-up-consultation" },
    ];
    expect(filterBookableServices(services, true).map((s) => s.slug)).toEqual([
      "initial-consultation",
      "follow-up-consultation",
    ]);
  });
});
