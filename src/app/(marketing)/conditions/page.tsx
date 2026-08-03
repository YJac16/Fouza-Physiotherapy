import Link from "next/link";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { ConditionCard } from "@/components/marketing/cards";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { conditionHref, conditions, persistentPainAudiences } from "@/content/conditions";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Conditions We Treat | Fouza Physiotherapy",
  description:
    "Persistent pain physiotherapy in Walmer Estate — low back, neck, shoulder, hip and knee pain, tendon pain, fibromyalgia, osteoarthritis, and pain after surgery.",
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
        description="Special interest in the assessment and management of persistent pain — helping people make sense of their pain, restore confidence in movement, and return to the activities that matter most."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Conditions" },
        ]}
      />

      <Section spacing="md" tone="muted">
        <Container>
          <SectionHeader
            eyebrow="Who this is for"
            title="When pain hasn’t settled as expected"
            description="You don’t need a perfect diagnosis label to get help. These are common reasons people seek care here."
          />
          <ul className="mt-2 grid gap-3 tablet:grid-cols-2">
            {persistentPainAudiences.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-border/80 bg-card px-5 py-4 text-sm leading-relaxed text-foreground shadow-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <SectionHeader
            eyebrow="Conditions"
            title="Find guidance for your concern"
            description="Focus areas include persistent and chronic pain conditions. Not sure if yours is listed? Contact us — we treat a wide range of musculoskeletal concerns."
          />
          <div className="grid gap-4 tablet:grid-cols-2 lg:grid-cols-3">
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
            <Typography variant="small" className="mx-auto mb-6 max-w-md text-muted-foreground">
              Persistent pain that has lasted longer than expected is always worth a conversation —
              even when it doesn’t match a named diagnosis on this page.
            </Typography>
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
