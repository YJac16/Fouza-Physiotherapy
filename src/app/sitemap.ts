import type { MetadataRoute } from "next";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { blogPosts } from "@/content/blog";
import { conditions } from "@/content/conditions";
import { services } from "@/content/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const staticPaths = [
    routes.marketing.home,
    routes.marketing.about,
    routes.marketing.meetFouza,
    routes.marketing.services,
    routes.marketing.conditions,
    routes.marketing.pricing,
    routes.marketing.faq,
    routes.marketing.contact,
    routes.marketing.blog,
    routes.marketing.reviews,
    routes.marketing.privacy,
    routes.marketing.terms,
    routes.booking.root,
  ];

  return [
    ...staticPaths.map((path) => ({
      url: `${base}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...services.map((service) => ({
      url: `${base}${routes.marketing.service(service.slug)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...conditions.map((condition) => ({
      url: `${base}${routes.marketing.condition(condition.slug)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...blogPosts.map((post) => ({
      url: `${base}${routes.marketing.blogPost(post.slug)}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
