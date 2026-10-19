import { Info } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PricingCard } from "@/components/shared/pricing-card";
import { RegistrationDetails } from "@/components/marketing/registration-details";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { pricingNotices, pricingPlans } from "@/content/pricing";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { TrackViewItem } from "@/components/analytics/marketing-tracker";

export const metadata: Metadata = buildMetadata({
  title: "Physiotherapy fees and pricing",
  description:
    "Straightforward physiotherapy fees at Fouza Physiotherapy. Payment is made directly to the practice; detailed statements for medical aid claims are available on request.",
  path: routes.marketing.pricing,
});

const notices = [
  pricingNotices.assessmentOnly,
  pricingNotices.referralLetter,
  pricingNotices.cancellation,
];

export default function PricingPage() {
  return (
    <>
      <TrackViewItem itemId="pricing" itemName="Pricing" />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Pricing", path: routes.marketing.pricing },
        ])}
      />

      <Section tone="hero" spacing="sm" className="border-b border-border/60">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.marketing.home },
              { label: "Pricing" },
            ]}
            className="mb-6"
          />
          <Typography as="h1" variant="h1" className="max-w-3xl text-balance">
            Physiotherapy fees and pricing
          </Typography>
          <Typography variant="body-lg" className="mt-4 max-w-2xl leading-relaxed">
            We believe healthcare should be straightforward. Payment is made
            directly to the practice after your consultation. As we are not
            contracted to medical aid schemes, payment cannot be claimed
            directly from the practice.
          </Typography>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <div className="grid gap-6 tablet:grid-cols-2 lg:grid-cols-3">
            {pricingPlans.map((plan) => {
              const returningPatient = plan.id !== "initial";
              return (
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
                    returningPatient ? (
                      <div className="flex w-full flex-col gap-2">
                        <Button asChild className="h-auto min-h-11 w-full whitespace-normal py-2.5" variant="outline">
                          <Link href={`${routes.auth.login}?next=${encodeURIComponent(routes.booking.root)}`}>
                            Existing patients: sign in to book
                          </Link>
                        </Button>
                        <Button asChild className="w-full" variant="ghost">
                          <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
                            WhatsApp us instead
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                        <Link
                          href={routes.booking.root}
                          data-item-id={plan.id}
                          data-item-name={plan.title}
                        >
                          Book this session
                        </Link>
                      </Button>
                    )
                  }
                />
              );
            })}
          </div>
        </Container>
      </Section>

      <Section spacing="md" tone="muted">
        <Container size="md">
          <div className="max-w-2xl space-y-3">
            <Typography as="h2" variant="h4" className="text-balance">
              {pricingNotices.medicalAidClaims.title}
            </Typography>
            <Typography variant="body" className="leading-relaxed text-muted-foreground">
              {pricingNotices.medicalAidClaims.body}
            </Typography>
            <Typography variant="body" className="leading-relaxed text-foreground">
              A statement for your medical aid is available on request after payment.
            </Typography>
            <RegistrationDetails practiceStyle="pcns" className="text-foreground" />
          </div>
        </Container>
      </Section>

      <Section spacing="md" tone="muted">
        <Container size="md">
          <SectionHeader
            eyebrow="Before you visit"
            title="A few practical details"
            description="Clear expectations around assessment fees, referrals, and cancellations."
          />
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
              Happy to talk it through
            </Typography>
            <Typography variant="body-lg" className="mx-auto mt-3 max-w-lg">
              If you&apos;re unsure what to expect before your visit, WhatsApp
              us or send a message via the contact page — we&apos;re glad to help.
            </Typography>
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 md:flex-row md:items-center [&_a]:w-full md:[&_a]:w-auto">
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
