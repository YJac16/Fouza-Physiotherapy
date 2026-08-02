import {
  googleBusinessProfile,
  officialGoogleReviews,
} from "@/content/google-reviews";
import type { Testimonial } from "@/content/testimonials";
import { reviewSummary } from "@/content/testimonials";
import { createClient } from "@/lib/supabase/server";

export type PublicReviewsPayload = {
  reviews: Testimonial[];
  rating: number;
  countLabel: string;
  headline: string;
  fromLiveCache: boolean;
};

function catalogAsTestimonials(limit?: number): Testimonial[] {
  const rows = officialGoogleReviews.map((r) => ({
    id: r.googleReviewId,
    author: r.authorName,
    rating: r.rating,
    content: r.text,
    date: r.reviewedAt.slice(0, 7),
    source: "Google",
    featured: r.featured,
  }));
  return typeof limit === "number" ? rows.slice(0, limit) : rows;
}

export async function getPublicGoogleReviews(
  limit = 12,
  options?: { featuredFirst?: boolean },
): Promise<PublicReviewsPayload> {
  const featuredFirst = options?.featuredFirst ?? limit <= 6;

  try {
    const supabase = await createClient();
    let query = supabase
      .from("google_reviews")
      .select("id, author_name, text, rating, reviewed_at, is_featured")
      .eq("is_visible", true);

    if (featuredFirst) {
      query = query
        .eq("is_featured", true)
        .order("reviewed_at", { ascending: false })
        .limit(limit);
    } else {
      query = query.order("reviewed_at", { ascending: false }).limit(limit);
    }

    const { data } = await query;

    if (data && data.length > 0) {
      const reviews = data.map((r) => ({
        id: r.id,
        author: r.author_name,
        content: r.text ?? "",
        rating: r.rating,
        date: r.reviewed_at?.slice(0, 7),
        source: "Google",
        featured: r.is_featured,
      }));
      return {
        reviews,
        rating: googleBusinessProfile.rating,
        countLabel: `${googleBusinessProfile.reviewCount} Google reviews`,
        headline: reviewSummary.headline,
        fromLiveCache: true,
      };
    }
  } catch {
    // Fall through to catalog when Supabase is unavailable.
  }

  const catalog = featuredFirst
    ? catalogAsTestimonials().filter((r) => r.featured).slice(0, limit)
    : catalogAsTestimonials(limit);

  return {
    reviews: catalog.length ? catalog : catalogAsTestimonials(limit),
    rating: googleBusinessProfile.rating,
    countLabel: reviewSummary.countLabel,
    headline: reviewSummary.headline,
    fromLiveCache: false,
  };
}
