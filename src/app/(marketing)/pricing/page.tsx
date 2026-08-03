import { Info } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { PricingCard } from "@/components/shared/pricing-card";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { pricingNotices, pricingPlans } from "@/content/pricing";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Pricing | Fouza Physiotherapy",
  description:
    "Transparent physiotherapy pricing at Fouza Physiotherapy — cash-based practice with professional statements for medical aid claims available upon request.",
  path: routes.marketing.pricing,
});

const notices = [
  pricingNotices.cashPractice,
  pricingNotices.assessmentOnly,
  pricingNotices.referralLetter,
  pricingNotices.cancellation,
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Pricing", path: routes.marketing.pricing },
        ])}
      />

      <PageHero
        title="Simple, transparent pricing"
        description="Fouza Physiotherapy is a cash-based practice. You settle your account directly with us and can receive a professional statement to submit to your medical aid upon request."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Pricing" },
        ]}
      />

      <Section spacing="md">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                title={plan.title}
                price={plan.price}
                period={plan.period}
                description={plan.description}
                features={plan.features}
                highlighted={plan.highlighted}
                badge={plan.badge}
                cta={
                  <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                    <Link href={routes.booking.root}>Book this session</Link>
                  </Button>
                }
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="md" tone="muted">
        <Container size="md">
          <SectionHeader eyebrow="Good to know" title="Important pricing notes" />
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice}
                className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm"
              >
                <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <Typography variant="small" className="leading-relaxed text-foreground/90">
                  {notice}
                </Typography>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="md">
        <Container size="md">
          <div className="rounded-2xl border border-border/80 bg-card p-8 text-center shadow-sm tablet:p-10">
            <Typography as="h2" variant="h3" className="text-balance">
              Questions about medical aid or fees?
            </Typography>
            <Typography variant="body-lg" className="mx-auto mt-3 max-w-lg">
              WhatsApp us or send a message via the contact page and we&apos;ll
              help clarify what to expect before your visit.
            </Typography>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={routes.booking.root}>Book appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={routes.marketing.faq}>View FAQs</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
