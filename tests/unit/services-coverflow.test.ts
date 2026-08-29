import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";
import { serviceHref, services } from "@/content/services";
import {
  COVERFLOW_ACTIVE_SCALE,
  COVERFLOW_DWELL_MS,
  COVERFLOW_SIDE_SCALE,
  COVERFLOW_SLIDE_MS,
  rewindLoopedCoverflowIndex,
  shouldRunCoverflowAutoplay,
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

  it("autoplays only when the catalogue is visible, idle, and motion is allowed", () => {
    const ready = {
      reduceMotion: false,
      paused: false,
      inView: true,
      pageVisible: true,
      count: 5,
      dragging: false,
    };

    expect(shouldRunCoverflowAutoplay(ready)).toBe(true);
    expect(shouldRunCoverflowAutoplay({ ...ready, reduceMotion: true })).toBe(false);
    expect(shouldRunCoverflowAutoplay({ ...ready, paused: true })).toBe(false);
    expect(shouldRunCoverflowAutoplay({ ...ready, inView: false })).toBe(false);
    expect(shouldRunCoverflowAutoplay({ ...ready, pageVisible: false })).toBe(false);
    expect(shouldRunCoverflowAutoplay({ ...ready, dragging: true })).toBe(false);
    expect(shouldRunCoverflowAutoplay({ ...ready, count: 1 })).toBe(false);
  });

  it("rewinds clone indices to the matching real card in the middle band", () => {
    expect(rewindLoopedCoverflowIndex(10, 5)).toBe(5);
    expect(rewindLoopedCoverflowIndex(4, 5)).toBe(9);
    expect(rewindLoopedCoverflowIndex(7, 5)).toBeNull();
    expect(rewindLoopedCoverflowIndex(5, 5)).toBeNull();
    expect(rewindLoopedCoverflowIndex(0, 1)).toBeNull();
  });
});
