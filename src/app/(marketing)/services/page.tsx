import Link from "next/link";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { ServiceCard } from "@/components/marketing/cards";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { serviceHref, services } from "@/content/services";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Physiotherapy Services | Fouza Physiotherapy",
  description:
    "Explore physiotherapy services at Fouza Physiotherapy — dry needling, manual therapy, post-surgical rehab, and care for persistent pain.",
  path: routes.marketing.services,
});

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Services", path: routes.marketing.services },
        ])}
      />

      <PageHero
        title="Physiotherapy services tailored to you"
        description="From persistent pain to post-surgical rehabilitation, every service is delivered with the same evidence-based, personalised approach."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Services" },
        ]}
      />

      <Section spacing="md">
        <Container>
          <SectionHeader
            eyebrow="What we offer"
            title="Understanding your pain. Restoring your movement. Helping you get back to life."
            description="Every service combines thorough assessment, hands-on treatment where indicated, and a personalised exercise plan."
          />
          <div className="grid gap-6 tablet:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <ServiceCard
                  key={service.slug}
                  title={service.name}
                  description={service.shortDescription}
                  href={serviceHref(service.slug)}
                  icon={<Icon className="size-5" />}
                  imageSrc={service.image}
                />
              );
            })}
          </div>
        </Container>
      </Section>

      <Section spacing="md" tone="muted">
        <Container size="md">
          <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent-soft/40 p-8 text-center shadow-soft tablet:p-12">
            <SectionHeader
              title="Not sure which service you need?"
              description="Contact us or WhatsApp and we'll help you find the right starting point."
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
