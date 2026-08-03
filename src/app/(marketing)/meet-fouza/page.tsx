import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { Timeline } from "@/components/shared/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { FadeIn } from "@/components/ui/motion";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { fouzaBio } from "@/content/fouza";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Meet Fouza Abrahams | Fouza Physiotherapy",
  description:
    "Meet Fouza Abrahams, HPCSA-registered physiotherapist and founder of Fouza Physiotherapy in Walmer Estate, Cape Town.",
  path: routes.marketing.meetFouza,
});

export default function MeetFouzaPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Meet Fouza", path: routes.marketing.meetFouza },
        ])}
      />

      <PageHero
        title={`Meet ${fouzaBio.name}`}
        description={fouzaBio.intro}
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Meet Fouza" },
        ]}
      />

      <Section spacing="md">
        <Container>
          <div className="grid items-start gap-10 tablet:grid-cols-[minmax(0,380px)_1fr] tablet:gap-16">
            <div className="space-y-6">
              <FadeIn className="relative overflow-hidden tablet:sticky tablet:top-24">
                <div
                  className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/15 via-accent-soft/40 to-transparent blur-2xl"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-[1.75rem] shadow-soft-lg">
                  <Image
                    src={fouzaBio.images.portrait}
                    alt={fouzaBio.name}
                    width={800}
                    height={1000}
                    priority
                    className="aspect-[4/5] w-full object-cover"
                  />
                </div>
              </FadeIn>
              <div className="flex flex-col gap-2">
                <Badge className="w-fit">{fouzaBio.credentials}</Badge>
                <Badge variant="accent" className="w-fit">
                  {fouzaBio.registration}
                </Badge>
                <Badge variant="secondary" className="w-fit">
                  Private practice since 2021
                </Badge>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
                <Image
                  src={siteConfig.images.hpcsa}
                  alt="HPCSA registered"
                  width={56}
                  height={56}
                  className="size-12 shrink-0 object-contain"
                />
                <div>
                  <Typography as="p" variant="h5" className="text-sm">
                    HPCSA Registered
                  </Typography>
                  <Typography variant="caption" className="normal-case">
                    Health Professions Council of South Africa
                  </Typography>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <Typography variant="caption" className="text-accent">
                  Her story
                </Typography>
                {fouzaBio.story.map((paragraph, index) => (
                  <Typography key={index} variant="body-lg">
                    {paragraph}
                  </Typography>
                ))}
              </div>

              <div>
                <SectionHeader
                  eyebrow="Career milestones"
                  title="From UCT to private practice"
                  className="mb-8"
                />
                <Timeline
                  items={fouzaBio.timeline.map((entry) => ({
                    id: entry.year,
                    title: entry.title,
                    description: entry.description,
                    meta: entry.year,
                  }))}
                />
              </div>

              <div>
                <SectionHeader
                  eyebrow="Qualifications"
                  title="Training and registration"
                  className="mb-8"
                />
                <div className="grid gap-4 tablet:grid-cols-2">
                  {fouzaBio.qualifications.map((qualification) => {
                    const Icon = qualification.icon;
                    return (
                      <Card key={qualification.title} className="overflow-hidden shadow-sm">
                        <CardContent className="flex gap-4 p-5">
                          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
                            <Icon className="size-5" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Typography as="p" variant="h5" className="text-sm break-words">
                              {qualification.title}
                            </Typography>
                            <Typography variant="small" className="mt-1 leading-relaxed break-words">
                              {qualification.description}
                            </Typography>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md" tone="muted">
        <Container>
          <SectionHeader
            eyebrow="Special interests"
            title="Areas Fouza is especially passionate about"
            description="While every physiotherapy concern is welcome, these are the areas Fouza has developed particular depth in."
          />
          <div className="grid gap-6 tablet:grid-cols-2 lg:grid-cols-3">
            {fouzaBio.specialInterests.map((interest) => {
              const Icon = interest.icon;
              return (
                <Card key={interest.title} className="h-full shadow-sm">
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <div className="space-y-2">
                      <Typography as="h3" variant="h5">
                        {interest.title}
                      </Typography>
                      <Typography variant="small" className="leading-relaxed">
                        {interest.description}
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <SectionHeader
            eyebrow="In the clinic"
            title="A closer look at treatment with Fouza"
          />
          <div className="grid gap-4 tablet:grid-cols-2 lg:grid-cols-3">
            {[
              { src: fouzaBio.images.treatment, alt: "Fouza treating a patient" },
              { src: fouzaBio.images.clinic, alt: "Fouza Physiotherapy clinic" },
              { src: fouzaBio.images.hero, alt: "Physiotherapy session in progress" },
            ].map((image) => (
              <div key={image.src} className="overflow-hidden rounded-2xl shadow-sm">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={700}
                  height={560}
                  className="aspect-[5/4] w-full object-cover transition-transform duration-350 ease-premium hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="md" tone="soft">
        <Container size="md">
          <SectionHeader
            eyebrow="Treatment philosophy"
            title="How Fouza approaches every patient"
            align="center"
            className="mx-auto"
          />
          <div className="grid gap-6 tablet:grid-cols-2">
            {fouzaBio.philosophy.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
              >
                <Typography as="h3" variant="h5">
                  {item.title}
                </Typography>
                <Typography variant="small" className="mt-2 leading-relaxed">
                  {item.description}
                </Typography>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="md">
        <Container size="md">
          <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent-soft/40 p-8 text-center shadow-soft tablet:p-12">
            <Typography as="h2" variant="h2" className="text-balance">
              Book your assessment with {fouzaBio.name}
            </Typography>
            <Typography variant="body-lg" className="mx-auto mt-3 max-w-lg">
              Experience personalised, evidence-based physiotherapy care from
              a practitioner who takes the time to understand you.
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
    </>
  );
}
