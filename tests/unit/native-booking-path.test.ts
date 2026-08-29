import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";
import { medicalBusinessJsonLd } from "@/lib/seo/json-ld";

describe("native booking is the only public path", () => {
  it("does not keep an external booking URL on siteConfig", () => {
    expect("bookingExternalUrl" in siteConfig).toBe(false);
    expect(JSON.stringify(siteConfig)).not.toMatch(/setmore\.com/i);
  });

  it("does not advertise Setmore in business JSON-LD", () => {
    const data = medicalBusinessJsonLd();
    expect(JSON.stringify(data)).not.toMatch(/setmore\.com/i);
  });
});
