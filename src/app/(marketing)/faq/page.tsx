import Link from "next/link";
import type { Metadata } from "next";

import { FaqSearch, PageHero } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { faqs } from "@/content/faqs";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Frequently Asked Questions | Fouza Physiotherapy",
  description:
    "Answers to common questions about booking, payments, medical aid, dry needling, and treatment at Fouza Physiotherapy.",
  path: routes.marketing.faq,
});

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "FAQs", path: routes.marketing.faq },
        ])}
      />
      <JsonLd data={faqJsonLd(faqs.map((f) => ({ question: f.question, answer: f.answer })))} />

      <PageHero
        title="Frequently asked questions"
        description="Everything you need to know before your first visit. Can't find your answer? Contact us directly."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "FAQs" },
        ]}
      />

      <Section spacing="md">
        <Container size="md">
          <SectionHeader
            title="Browse common questions"
            description="Search or choose a topic. Each answer sits under this heading."
            className="mb-6"
          />
          <FaqSearch />
        </Container>
      </Section>

      <Section spacing="md" tone="muted">
        <Container size="md">
          <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent-soft/40 p-8 text-center shadow-soft tablet:p-12">
            <SectionHeader
              title="Still have a question?"
              description="WhatsApp or email us — we're happy to help before you book."
              align="center"
              className="mx-auto mb-6"
            />
            <Typography variant="small" className="mb-6">
              {siteConfig.email}
            </Typography>
            <div className="flex w-full flex-col gap-3 md:flex-row md:justify-center">
              <Button asChild size="lg" className="w-full md:w-auto">
                <Link href={routes.marketing.contact}>Contact us</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full md:w-auto">
                <Link href={routes.booking.root}>Book appointment</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
