import { describe, expect, it } from "vitest";

import { shortPageTitle } from "@/lib/seo/metadata";

describe("page titles", () => {
  it("strips a duplicated brand suffix", () => {
    expect(shortPageTitle("Contact Us | Fouza Physiotherapy")).toBe("Contact Us");
    expect(shortPageTitle("Contact Us")).toBe("Contact Us");
    expect(shortPageTitle("Fouza Physiotherapy")).toBe("Fouza Physiotherapy");
  });
});
