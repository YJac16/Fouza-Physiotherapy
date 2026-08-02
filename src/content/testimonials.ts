import {
  googleBusinessProfile,
  officialGoogleReviews,
} from "@/content/google-reviews";

export type Testimonial = {
  id: string;
  author: string;
  rating: number;
  content: string;
  date?: string;
  source?: string;
  featured?: boolean;
};

/** Featured Google Business reviews used as marketing fallback. */
export const testimonials: Testimonial[] = officialGoogleReviews
  .filter((r) => r.featured)
  .map((r) => ({
    id: r.googleReviewId,
    author: r.authorName,
    rating: r.rating,
    content: r.text,
    date: r.reviewedAt.slice(0, 7),
    source: "Google",
    featured: true,
  }));

export const reviewSummary = {
  rating: googleBusinessProfile.rating,
  countLabel: `${googleBusinessProfile.reviewCount} Google reviews`,
  headline: "Trusted, personal physiotherapy care",
};
