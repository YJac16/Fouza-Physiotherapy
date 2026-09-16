import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";
import { marketingDeviceSizes, marketingImageSizes } from "@/lib/images";

const publicFile = (src: string) => path.join(process.cwd(), "public", src.replace(/^\//, ""));

const homepageServiceImages = [
  siteConfig.images.dryNeedling,
  siteConfig.images.treatment,
  siteConfig.images.backRehab,
  siteConfig.images.posture,
  siteConfig.images.shoulderRehab,
];

describe("homepage service images", () => {
  it("keeps gallery/service sources well under a few hundred KB", () => {
    for (const src of homepageServiceImages) {
      const { size } = statSync(publicFile(src));
      expect(size, `${src} is ${Math.round(size / 1024)}KB`).toBeLessThan(350_000);
    }
  });

  it("does not leave camera-resolution PNG sources for dry needling", () => {
    expect(siteConfig.images.dryNeedling).toBe("/dry-needling.jpg");
  });

  it("caps next/image device widths at 1920 so laptops never request 4K", () => {
    expect(Math.max(...marketingDeviceSizes)).toBe(1920);
    expect(marketingDeviceSizes).not.toContain(3840);
    expect(marketingDeviceSizes).not.toContain(2048);
  });

  it("declares card/coverflow sizes tighter than 100vw", () => {
    expect(marketingImageSizes.coverflow).toMatch(/300px/);
    expect(marketingImageSizes.card).toMatch(/400px|33vw|46vw/);
    expect(marketingImageSizes.hero).not.toBe("100vw");
  });

  it("serves service cards through next/image instead of raw img tags", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src/components/marketing/cards.tsx"),
      "utf8",
    );
    expect(source).toContain('from "next/image"');
    expect(source).toContain("marketingImageSizes.card");
    expect(source).not.toMatch(/<img[\s\S]*imageSrc/);
  });
});
