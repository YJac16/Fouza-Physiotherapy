import { CheckCircle2, Clock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { ServiceCard } from "@/components/marketing/cards";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { Timeline } from "@/components/shared/timeline";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { getService, serviceHref, services } from "@/content/services";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { TrackViewItem } from "@/components/analytics/marketing-tracker";

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    return buildMetadata({
      title: "Service Not Found | Fouza Physiotherapy",
      description: "The service you are looking for could not be found.",
      path: routes.marketing.service(slug),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${service.name} | Fouza Physiotherapy`,
    description: service.shortDescription,
    path: serviceHref(service.slug),
    image: service.image,
  });
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    notFound();
  }

  const Icon = service.icon;
  const related = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Services", path: routes.marketing.services },
          { name: service.name, path: serviceHref(service.slug) },
        ])}
      />
      {service.faqs.length > 0 ? <JsonLd data={faqJsonLd(service.faqs)} /> : null}
      <TrackViewItem itemId={service.slug} itemName={service.name} />

      <PageHero
        title={service.name}
        description={service.shortDescription}
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Services", href: routes.marketing.services },
          { label: service.name },
        ]}
      />

      <Section spacing="md">
        <Container>
          <div className="grid items-start gap-10 tablet:grid-cols-2 tablet:gap-16">
            <div className="order-2 space-y-6 tablet:order-1">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
                  <Icon className="size-6" aria-hidden />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" aria-hidden />
                  <span>{service.duration}</span>
                </div>
              </div>
              <Typography variant="body-lg">{service.overview}</Typography>
            </div>
            <div className="order-1 overflow-hidden rounded-[1.75rem] shadow-soft-lg tablet:order-2">
              <Image
                src={service.image}
                alt={service.name}
                width={900}
                height={720}
                priority
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" tone="muted">
        <Container>
          <div className="grid gap-10 tablet:grid-cols-2">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <Users className="size-5 text-primary" aria-hidden />
                <Typography as="h2" variant="h3">
                  Who this helps
                </Typography>
              </div>
              <ul className="space-y-3">
                {service.whoItHelps.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-6 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" aria-hidden />
                <Typography as="h2" variant="h3">
                  Benefits
                </Typography>
              </div>
              <ul className="space-y-3">
                {service.benefits.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md">
        <Container size="lg">
          <SectionHeader
            eyebrow="What to expect"
            title={`Your ${service.name.toLowerCase()} journey`}
            description={`Typical session length: ${service.duration}.`}
          />
          <Timeline
            items={service.process.map((step, index) => ({
              id: `${service.slug}-${index}`,
              title: step,
            }))}
          />
        </Container>
      </Section>

      {service.faqs.length > 0 ? (
        <Section spacing="md" tone="soft">
          <Container size="md">
            <SectionHeader
              eyebrow="FAQs"
              title={`Common questions about ${service.name.toLowerCase()}`}
            />
            <FaqAccordion
              items={service.faqs.map((faq, index) => ({
                id: `${service.slug}-faq-${index}`,
                question: faq.question,
                answer: faq.answer,
              }))}
            />
          </Container>
        </Section>
      ) : null}

      <Section spacing="md">
        <Container size="md">
          <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent-soft/40 p-8 text-center shadow-soft tablet:p-12">
            <Typography as="h2" variant="h2" className="text-balance">
              Ready to book your {service.name.toLowerCase()} consultation?
            </Typography>
            <Typography variant="body-lg" className="mx-auto mt-3 max-w-lg">
              Take the first step towards a personalised recovery plan with
              Fouza Physiotherapy.
            </Typography>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={routes.booking.root}>Book appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={routes.marketing.contact}>Ask a question</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {related.length > 0 ? (
        <Section spacing="md" tone="muted">
          <Container>
            <SectionHeader eyebrow="Related" title="Other services you might need" />
            <div className="grid gap-6 tablet:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => {
                const RelatedIcon = item.icon;
                return (
                  <ServiceCard
                    key={item.slug}
                    title={item.name}
                    description={item.shortDescription}
                    href={serviceHref(item.slug)}
                    icon={<RelatedIcon className="size-5" />}
                    imageSrc={item.image}
                  />
                );
              })}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
