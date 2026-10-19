import { describe, expect, it } from "vitest";

import { blogPosts, getFeaturedPost } from "@/content/blog";
import { services } from "@/content/services";
import { populatedCategories, postsForBlogGrid } from "@/lib/blog-filters";
import { formatMonthYear } from "@/lib/format-month-year";
import { siteConfig } from "@/config/site";

describe("blog filters", () => {
  const featured = getFeaturedPost();

  it("keeps the featured recovery article in the Recovery tab", () => {
    const matches = postsForBlogGrid(blogPosts, featured?.slug, "Recovery", "");
    expect(matches.map((post) => post.slug)).toContain("why-movement-matters-in-recovery");
  });

  it("hides the featured article from the unfiltered grid", () => {
    const matches = postsForBlogGrid(blogPosts, featured?.slug, "All", "");
    expect(matches.map((post) => post.slug)).not.toContain(featured?.slug);
    expect(matches.length).toBe(blogPosts.length - 1);
  });

  it("drops categories that have no articles", () => {
    expect(populatedCategories(blogPosts, ["Recovery", "Unused"])).toEqual(["Recovery"]);
  });
});

describe("review dates", () => {
  it("formats year-month as a readable month", () => {
    expect(formatMonthYear("2025-08")).toBe("Aug 2025");
    expect(formatMonthYear("2025-08-01T00:00:00.000Z")).toBe("Aug 2025");
  });
});

describe("practice registration", () => {
  it("shows the confirmed practice number and hides an empty HPCSA number", () => {
    expect(siteConfig.founder.practiceNumber).toBe("0932469");
    expect(siteConfig.founder.hpcsaNumber).toBe("");
  });
});

describe("service meta descriptions", () => {
  it("are 140–155 characters and name the suburb", () => {
    for (const service of services) {
      expect(service.metaDescription.length).toBeGreaterThanOrEqual(140);
      expect(service.metaDescription.length).toBeLessThanOrEqual(155);
      expect(service.metaDescription).toContain("Walmer Estate, Cape Town");
    }
  });
});
