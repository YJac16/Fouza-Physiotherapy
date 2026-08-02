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
import { getPublicGoogleReviews } from "@/features/reviews";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Patient Reviews | Fouza Physiotherapy",
  description:
    "Read official Google reviews from patients at Fouza Physiotherapy in Walmer Estate, Cape Town.",
  path: routes.marketing.reviews,
});

export default async function ReviewsPage() {
  const { reviews, rating, countLabel, headline } =
    await getPublicGoogleReviews(24, { featuredFirst: false });

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
              description="Official Google Business reviews for Fouza Physiotherapy."
              className="mb-0"
            />
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <ReviewSummary
                rating={rating}
                headline={headline}
                countLabel={countLabel}
              />
              <LeaveReviewButton />
            </div>
          </div>
          <FeaturedReviews reviews={reviews} />
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
