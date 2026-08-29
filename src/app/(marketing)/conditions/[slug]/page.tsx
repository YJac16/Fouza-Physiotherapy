import { Activity, AlertTriangle, CheckCircle2, Stethoscope } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { ConditionCard } from "@/components/marketing/cards";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { conditionHref, conditions, getCondition } from "@/content/conditions";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import { marketingImageSizes } from "@/lib/images";
import { buildMetadata } from "@/lib/seo/metadata";
import { TrackViewItem } from "@/components/analytics/marketing-tracker";

interface ConditionPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return conditions.map((condition) => ({ slug: condition.slug }));
}

export async function generateMetadata({ params }: ConditionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const condition = getCondition(slug);

  if (!condition) {
    return buildMetadata({
      title: "Condition Not Found | Fouza Physiotherapy",
      description: "The condition you are looking for could not be found.",
      path: routes.marketing.condition(slug),
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${condition.name} Treatment | Fouza Physiotherapy`,
    description: condition.summary,
    path: conditionHref(condition.slug),
    image: condition.image,
  });
}

export default async function ConditionDetailPage({ params }: ConditionPageProps) {
  const { slug } = await params;
  const condition = getCondition(slug);

  if (!condition) {
    notFound();
  }

  const related = conditions.filter((c) => c.slug !== condition.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Conditions", path: routes.marketing.conditions },
          { name: condition.name, path: conditionHref(condition.slug) },
        ])}
      />
      {condition.faqs.length > 0 ? <JsonLd data={faqJsonLd(condition.faqs)} /> : null}
      <TrackViewItem itemId={condition.slug} itemName={condition.name} />

      <PageHero
        title={`${condition.name} Treatment`}
        description={condition.summary}
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Conditions", href: routes.marketing.conditions },
          { label: condition.name },
        ]}
      />

      <Section spacing="md">
        <Container>
          <div className="grid items-start gap-10 tablet:grid-cols-2 tablet:gap-16">
            <div className="order-2 tablet:order-1">
              <div className="mb-6 flex items-center gap-2">
                <AlertTriangle className="size-5 text-primary" aria-hidden />
                <Typography as="h2" variant="h3">
                  Common symptoms
                </Typography>
              </div>
              <ul className="space-y-3">
                {condition.symptoms.map((symptom) => (
                  <li key={symptom} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 overflow-hidden rounded-[1.75rem] shadow-soft-lg tablet:order-2">
              <Image
                src={condition.image}
                alt={`${condition.name} physiotherapy treatment`}
                width={900}
                height={720}
                sizes={marketingImageSizes.detail}
                priority
                className="aspect-[5/4] w-full object-cover"
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" tone="muted">
        <Container>
          <div className="mb-6 flex items-center gap-2">
            <Activity className="size-5 text-primary" aria-hidden />
            <Typography as="h2" variant="h3">
              Common causes
            </Typography>
          </div>
          <div className="grid gap-4 tablet:grid-cols-2 lg:grid-cols-3">
            {condition.causes.map((cause) => (
              <div key={cause} className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
                <Typography variant="small" className="leading-relaxed text-foreground/90">
                  {cause}
                </Typography>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <div className="grid gap-10 tablet:grid-cols-2">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <Stethoscope className="size-5 text-primary" aria-hidden />
                <Typography as="h2" variant="h3">
                  Our treatment approach
                </Typography>
              </div>
              <ul className="space-y-3">
                {condition.treatment.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground/90">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <Typography as="h3" variant="h5">
                Recovery outlook
              </Typography>
              <Typography variant="body-lg" className="mt-3 leading-relaxed">
                {condition.recovery}
              </Typography>
            </div>
          </div>
        </Container>
      </Section>

      {condition.faqs.length > 0 ? (
        <Section spacing="md" tone="soft">
          <Container size="md">
            <SectionHeader
              eyebrow="FAQs"
              title={`Questions about ${condition.name.toLowerCase()}`}
            />
            <FaqAccordion
              items={condition.faqs.map((faq, index) => ({
                id: `${condition.slug}-faq-${index}`,
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
              Get help with your {condition.name.toLowerCase()}
            </Typography>
            <Typography variant="body-lg" className="mx-auto mt-3 max-w-lg">
              Book an assessment and start your personalised recovery plan
              today.
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
            <SectionHeader eyebrow="Related" title="Other conditions we treat" />
            <div className="grid gap-4 tablet:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ConditionCard
                  key={item.slug}
                  name={item.name}
                  summary={item.summary}
                  href={conditionHref(item.slug)}
                />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}
    </>
  );
}
