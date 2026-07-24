export type Testimonial = {
  id: string;
  author: string;
  rating: number;
  content: string;
  date?: string;
  source?: string;
  featured?: boolean;
};

/** Placeholder testimonials for layout — replace with live Google Reviews later. */
export const testimonials: Testimonial[] = [
  {
    id: "1",
    author: "Thandi M.",
    rating: 5,
    content:
      "Fouza explained everything clearly and helped me get back to walking without fear after my back flared up. The care felt personal and professional.",
    date: "2026-02",
    source: "Google",
    featured: true,
  },
  {
    id: "2",
    author: "James K.",
    rating: 5,
    content:
      "I came in with a stubborn shoulder. The combination of hands-on treatment and a realistic exercise plan made a noticeable difference within a few sessions.",
    date: "2026-01",
    source: "Google",
    featured: true,
  },
  {
    id: "3",
    author: "Ayesha R.",
    rating: 5,
    content:
      "Warm, evidence-based care. I felt listened to, and my pregnancy-related back pain became much more manageable.",
    date: "2025-11",
    source: "Google",
    featured: true,
  },
];

export const reviewSummary = {
  rating: 5,
  countLabel: "Patient experiences",
  headline: "Trusted, personal physiotherapy care",
};
