import Link from "next/link";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { ConditionCard } from "@/components/marketing/cards";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { conditionHref, conditions } from "@/content/conditions";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Conditions We Treat | Fouza Physiotherapy",
  description:
    "Explore the conditions commonly treated at Fouza Physiotherapy, including back pain, sciatica, sports injuries, arthritis, and more.",
  path: routes.marketing.conditions,
});

export default function ConditionsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Conditions", path: routes.marketing.conditions },
        ])}
      />

      <PageHero
        title="Conditions we commonly treat"
        description="Dedicated, evidence-based guidance for the concerns that bring people through our door — from acute injuries to persistent pain."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Conditions" },
        ]}
      />

      <Section spacing="md">
        <Container>
          <SectionHeader
            eyebrow="Conditions"
            title="Find guidance for your concern"
            description="Not sure if your condition is listed? Contact us — we treat a wide range of musculoskeletal and neuromuscular concerns."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {conditions.map((condition) => (
              <ConditionCard
                key={condition.slug}
                name={condition.name}
                summary={condition.summary}
                href={conditionHref(condition.slug)}
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="md" tone="muted">
        <Container size="md">
          <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent-soft/40 p-8 text-center shadow-soft tablet:p-12">
            <SectionHeader
              title="Don't see your condition listed?"
              description="Every case is unique. Reach out and we'll let you know how we can help."
              align="center"
              className="mx-auto mb-6"
            />
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={routes.booking.root}>Book appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={routes.marketing.contact}>Contact us</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
