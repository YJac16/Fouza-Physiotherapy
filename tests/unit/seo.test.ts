import { describe, expect, it } from "vitest";

import { absoluteUrl, buildMetadata } from "@/lib/seo/metadata";

describe("seo metadata", () => {
  it("builds canonical absolute urls", () => {
    expect(absoluteUrl("/about")).toContain("/about");
  });

  it("includes open graph fields", () => {
    const meta = buildMetadata({
      title: "About",
      description: "About the practice",
      path: "/about",
    });
    expect(meta.openGraph?.title).toBe("About | Fouza Physiotherapy");
    expect(meta.title).toBe("About");
    expect(meta.alternates?.canonical).toBeTruthy();
  });
});
