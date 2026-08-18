import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";
import { siteConfig } from "@/config/site";
import { faqs } from "@/content/faqs";

describe("web app manifest", () => {
  const webManifest = manifest();

  it("meets installability fields", () => {
    expect(webManifest.name).toBe(siteConfig.name);
    expect(webManifest.short_name).toBe(siteConfig.pwa.shortName);
    expect(webManifest.display).toBe("standalone");
    expect(webManifest.start_url).toBe("/");
    expect(webManifest.scope).toBe("/");
    expect(webManifest.theme_color).toBe(siteConfig.pwa.themeColor);
    expect(webManifest.background_color).toBe(siteConfig.pwa.backgroundColor);
  });

  it("includes 192 and 512 icons plus a maskable 512", () => {
    const icons = webManifest.icons ?? [];
    expect(icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: siteConfig.images.icon192,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        }),
        expect.objectContaining({
          src: siteConfig.images.icon512,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        }),
        expect.objectContaining({
          src: siteConfig.images.icon512Maskable,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        }),
      ]),
    );
  });
});

describe("home screen FAQ", () => {
  it("explains how to add the site to the Home Screen", () => {
    const item = faqs.find((faq) => faq.id === "web-1");
    expect(item?.category).toBe("Website");
    expect(item?.question).toMatch(/Home Screen/i);
    expect(item?.answer).toMatch(/Safari/i);
    expect(item?.answer).toMatch(/Android/i);
  });
});
