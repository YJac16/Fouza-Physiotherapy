import { Compass, HeartHandshake, Microscope, Sparkles, Target, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { FeatureCard } from "@/components/shared/feature-card";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { fouzaBio } from "@/content/fouza";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About Us | Fouza Physiotherapy",
  description:
    "Learn about Fouza Physiotherapy's story, mission, and evidence-based approach to rehabilitation in Walmer Estate, Cape Town.",
  path: routes.marketing.about,
});

const values = [
  {
    title: "Evidence-based care",
    description: "Every treatment decision is guided by current physiotherapy research and clinical reasoning.",
    icon: Microscope,
  },
  {
    title: "Genuine partnership",
    description: "You are an active participant in your recovery — we explain, listen, and adjust together.",
    icon: HeartHandshake,
  },
  {
    title: "Individualised plans",
    description: "No two patients are the same. Your goals, lifestyle, and preferences shape your programme.",
    icon: Users,
  },
  {
    title: "Clarity over confusion",
    description: "We translate clinical findings into plain language so you always know your next step.",
    icon: Target,
  },
  {
    title: "Purposeful hands-on care",
    description: "Manual therapy and dry needling are used with intent — as part of a broader rehabilitation plan.",
    icon: Sparkles,
  },
  {
    title: "Calm, modern environment",
    description: "A welcoming space designed to make treatment feel comfortable, never clinical or cold.",
    icon: Compass,
  },
];

const approach = [
  {
    title: "Listen and assess",
    description:
      "We start with a thorough history and movement assessment — understanding not just where it hurts, but how it affects your daily life.",
  },
  {
    title: "Explain clearly",
    description:
      "You'll always know what we found and why we're recommending a particular approach, in language that makes sense to you.",
  },
  {
    title: "Treat with intent",
    description:
      "Hands-on therapy, dry needling, and other techniques are used purposefully alongside progressive, active rehabilitation.",
  },
  {
    title: "Build lasting capacity",
    description:
      "Every programme includes home exercise and education so progress continues well beyond the treatment room.",
  },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "About", path: routes.marketing.about },
        ])}
      />

      <PageHero
        title="Physiotherapy built on trust, evidence, and genuine care"
        description="Fouza Physiotherapy exists to help people in Walmer Estate and across Cape Town move better, feel better, and live better — through personalised, evidence-based rehabilitation."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "About" },
        ]}
      />

      <Section spacing="md">
        <Container>
          <div className="grid items-center gap-10 tablet:grid-cols-2 tablet:gap-16">
            <div className="space-y-5">
              <Typography variant="caption" className="text-accent">
                Our story
              </Typography>
              <Typography as="h2" variant="h2" className="text-balance">
                A practice founded on personal, unhurried care
              </Typography>
              <div className="space-y-4">
                <Typography variant="body-lg">
                  Fouza Physiotherapy was founded in 2021 by Fouza Abrahams, a
                  UCT-trained physiotherapist who wanted to offer something
                  different: care that takes the time to understand each
                  patient as an individual, not just a diagnosis.
                </Typography>
                <Typography variant="body-lg">
                  After graduating from the University of Cape Town in 2018 and
                  completing her community service year in 2019 across busy
                  public healthcare settings, Fouza saw first-hand how much
                  patients benefit from clear communication, thorough
                  assessment, and a treatment plan they can actually follow.
                  That experience became the foundation of this practice.
                </Typography>
                <Typography variant="body-lg">
                  Today, Fouza Physiotherapy serves the Walmer Estate
                  community and beyond — with a special interest in the
                  assessment and management of persistent pain, helping people
                  make sense of their pain, restore confidence in movement, and
                  return to the activities that matter most.
                </Typography>
              </div>
            </div>
            <FadeIn className="relative">
              <div
                className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/15 via-accent-soft/40 to-transparent blur-2xl"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-[1.75rem] shadow-soft-lg">
                <Image
                  src={siteConfig.images.clinic}
                  alt="Inside Fouza Physiotherapy clinic"
                  width={900}
                  height={1100}
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </Container>
      </Section>

      <Section spacing="md" tone="muted">
        <Container>
          <div className="grid gap-6 tablet:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card p-8 shadow-sm">
              <Typography variant="caption" className="text-accent">
                Our mission
              </Typography>
              <Typography as="h3" variant="h3" className="mt-3 text-balance break-words">
                To help every patient move better, feel better, and live
                better
              </Typography>
              <Typography variant="body-lg" className="mt-4 break-words">
                We provide personalised, evidence-based physiotherapy that
                helps people make sense of persistent pain, restore function,
                and build lasting confidence in movement — delivered with
                warmth, clarity, and clinical rigour.
              </Typography>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card p-8 shadow-sm">
              <Typography variant="caption" className="text-accent">
                Our vision
              </Typography>
              <Typography as="h3" variant="h3" className="mt-3 text-balance break-words">
                A trusted physiotherapy home for our community
              </Typography>
              <Typography variant="body-lg" className="mt-4 break-words">
                We want Fouza Physiotherapy to be the practice Walmer Estate
                and greater Cape Town turn to — not only when injured, but as
                a long-term partner in staying active, resilient, and well.
              </Typography>
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <SectionHeader
            eyebrow="Our values"
            title="What guides every session"
            description="These principles shape how we assess, treat, and communicate with every patient who walks through our door."
          />
          <div className="grid gap-6 tablet:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <FeatureCard
                key={value.title}
                icon={value.icon}
                title={value.title}
                description={value.description}
              />
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="md" tone="soft">
        <Container size="lg">
          <SectionHeader
            eyebrow="Our approach"
            title="Evidence-based, always explained"
            description="Fouza Physiotherapy follows a consistent, transparent process so you always understand your care."
          />
          <div className="grid gap-6 tablet:grid-cols-2">
            {approach.map((step, index) => (
              <div
                key={step.title}
                className="overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-soft-foreground">
                  {index + 1}
                </span>
                <Typography as="h3" variant="h5" className="mt-4 break-words">
                  {step.title}
                </Typography>
                <Typography variant="small" className="mt-2 leading-relaxed break-words">
                  {step.description}
                </Typography>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section spacing="md">
        <Container>
          <SectionHeader
            eyebrow="Our space"
            title="A calm, modern clinic in Walmer Estate"
            description="Designed to make treatment feel comfortable — never rushed or clinical."
          />
          <div className="grid gap-4 tablet:grid-cols-2 lg:grid-cols-3">
            {[
              { src: siteConfig.images.clinic, alt: "Rehab gym space at Fouza Physiotherapy" },
              { src: siteConfig.images.treatment, alt: "Hands-on physiotherapy assessment on the treatment table" },
              { src: siteConfig.images.sports, alt: "Guided exercise rehabilitation session" },
            ].map((image) => (
              <div
                key={image.src}
                className="overflow-hidden rounded-2xl shadow-sm"
              >
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

      <Section spacing="md" tone="muted">
        <Container size="md">
          <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent-soft/40 p-8 text-center shadow-soft tablet:p-12">
            <Typography as="h2" variant="h2" className="text-balance">
              Ready to start your recovery journey?
            </Typography>
            <Typography variant="body-lg" className="mx-auto mt-3 max-w-lg">
              Book an assessment with {fouzaBio.name} and experience
              evidence-based, personalised physiotherapy care.
            </Typography>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={routes.booking.root}>Book appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={routes.marketing.meetFouza}>Meet Fouza</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
