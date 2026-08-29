import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";
import { serviceHref, services } from "@/content/services";
import {
  COVERFLOW_ACTIVE_SCALE,
  COVERFLOW_DWELL_MS,
  COVERFLOW_SIDE_SCALE,
  COVERFLOW_SLIDE_MS,
} from "@/components/marketing/snap-coverflow";

const clinicImagePaths = new Set<string>(Object.values(siteConfig.images));

const travelCopy = [
  /safari/i,
  /winelands/i,
  /cape point/i,
  /chauffeur/i,
  /itinerary/i,
  /gold/i,
  /landscape/i,
];

describe("services coverflow catalogue", () => {
  it("uses real in-clinic images from siteConfig, not stock landscapes", () => {
    expect(services.length).toBeGreaterThanOrEqual(3);

    for (const service of services) {
      expect(clinicImagePaths.has(service.image)).toBe(true);
      expect(service.image.startsWith("/")).toBe(true);
      expect(service.image).not.toMatch(/unsplash|pexels|shutterstock/i);
    }
  });

  it("keeps two-line clinical captions in sentence case", () => {
    for (const service of services) {
      expect(service.qualifier.length).toBeGreaterThan(0);
      expect(service.qualifier).toBe(service.qualifier.trim());
      expect(service.qualifier).not.toBe(service.qualifier.toUpperCase());
      expect(service.name).not.toBe(service.name.toUpperCase());
      for (const banned of travelCopy) {
        expect(service.qualifier).not.toMatch(banned);
        expect(service.name).not.toMatch(banned);
      }
    }
  });

  it("links each service to its existing detail page", () => {
    for (const service of services) {
      expect(serviceHref(service.slug)).toBe(`/services/${service.slug}`);
    }
  });

  it("uses a calm clinic coverflow (modest scale, longer dwell)", () => {
    expect(COVERFLOW_ACTIVE_SCALE).toBeGreaterThanOrEqual(1.15);
    expect(COVERFLOW_ACTIVE_SCALE).toBeLessThanOrEqual(1.2);
    expect(COVERFLOW_SIDE_SCALE).toBeLessThan(COVERFLOW_ACTIVE_SCALE);
    expect(COVERFLOW_DWELL_MS).toBeGreaterThanOrEqual(5000);
    expect(COVERFLOW_DWELL_MS).toBeLessThanOrEqual(6000);
    expect(COVERFLOW_SLIDE_MS).toBeGreaterThanOrEqual(600);
  });
});
