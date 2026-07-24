import Link from "next/link";
import type { Metadata } from "next";

import {
  FeaturedReviews,
  LeaveReviewButton,
  PageHero,
  ReviewSummary,
} from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { reviewSummary, testimonials } from "@/content/testimonials";
import { createClient } from "@/lib/supabase/server";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Patient Reviews | Fouza Physiotherapy",
  description:
    "Read what patients say about their experience at Fouza Physiotherapy in Walmer Estate, Cape Town.",
  path: routes.marketing.reviews,
});

export default async function ReviewsPage() {
  let liveReviews: {
    id: string;
    author: string;
    quote: string;
    rating: number;
  }[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("google_reviews")
      .select("id, author_name, text, rating")
      .eq("is_visible", true)
      .order("synced_at", { ascending: false })
      .limit(12);
    liveReviews = (data ?? []).map((r) => ({
      id: r.id,
      author: r.author_name,
      quote: r.text,
      rating: r.rating,
    }));
  } catch {
    liveReviews = [];
  }

  const display =
    liveReviews.length > 0
      ? liveReviews.map((r) => ({
          id: r.id,
          author: r.author,
          content: r.quote,
          rating: r.rating,
          source: "Google",
        }))
      : testimonials;

  const avg =
    liveReviews.length > 0
      ? liveReviews.reduce((s, r) => s + r.rating, 0) / liveReviews.length
      : reviewSummary.rating;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Reviews", path: routes.marketing.reviews },
        ])}
      />

      <PageHero
        title="What our patients say"
        description="Real experiences from people who trusted us with their recovery."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Reviews" },
        ]}
      />

      <Section spacing="md">
        <Container>
          <div className="mb-10 flex flex-col gap-6 tablet:flex-row tablet:items-end tablet:justify-between">
            <SectionHeader
              eyebrow="Testimonials"
              title="Trusted, personal physiotherapy care"
              description={
                liveReviews.length
                  ? "Live Google Reviews synced for the practice."
                  : "A preview of patient experiences — connect Google Places to show live reviews."
              }
              className="mb-0"
            />
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <ReviewSummary
                rating={Number(avg.toFixed(1))}
                headline={reviewSummary.headline}
                countLabel={
                  liveReviews.length
                    ? `${liveReviews.length} Google reviews`
                    : reviewSummary.countLabel
                }
              />
              <LeaveReviewButton />
            </div>
          </div>
          <FeaturedReviews reviews={display} />
        </Container>
      </Section>

      <Section spacing="md" tone="muted">
        <Container size="md" className="text-center">
          <SectionHeader
            title="Ready to start your recovery?"
            description="Book online or contact the practice — we’re here to help."
          />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={routes.booking.root}>Book appointment</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={routes.marketing.contact}>Contact us</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
