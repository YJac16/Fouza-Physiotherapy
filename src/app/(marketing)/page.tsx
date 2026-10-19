import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import {
  BookingCta,
  ConditionsGrid,
  DoctorCard,
  FaqPreview,
  FeaturedReviews,
  GoogleReviewsSection,
  Hero,
  LeaveReviewButton,
  MeetFouza,
  ReviewSummary,
  ServiceCard,
  ServicesCoverflow,
  WhyChooseUs,
} from "@/components/marketing";
import { FeatureCard } from "@/components/shared/feature-card";
import { FaqAccordion } from "@/components/shared/faq-accordion";
import { Timeline } from "@/components/shared/timeline";
import { Button } from "@/components/ui/button";
import { FadeIn, SlideUp } from "@/components/ui/motion";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { conditions } from "@/content/conditions";
import { faqPreviewIds, faqs } from "@/content/faqs";
import { services, trustItems } from "@/content/services";
import { getPublicGoogleReviews } from "@/features/reviews";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Physiotherapy in Walmer Estate, Cape Town",
  description: siteConfig.description,
  path: "/",
});

const journey = [
  {
    id: "1",
    title: "Book online",
    description: "Choose a time that works for you.",
  },
  {
    id: "2",
    title: "Complete intake",
    description: "Share your history so we can prepare.",
  },
  {
    id: "3",
    title: "Consultation",
    description: "Thorough assessment and clear explanation.",
  },
  {
    id: "4",
    title: "Treatment",
    description: "Hands-on care tailored to your needs.",
  },
  {
    id: "5",
    title: "Exercise programme",
    description: "A plan you can follow at home.",
  },
  {
    id: "6",
    title: "Recovery",
    description: "Progress tracked toward your goals.",
  },
];

const whyChoose = [
  {
    title: "Evidence-based treatment",
    description: "Care guided by current physiotherapy research and clinical reasoning.",
    icon: trustItems[3].icon,
  },
  {
    title: "Individual care",
    description: "Personalised plans that respect your goals, lifestyle, and values.",
    icon: trustItems[4].icon,
  },
  {
    title: "Professional experience",
    description: "UCT-trained care with private practice experience since 2021.",
    icon: trustItems[2].icon,
  },
  {
    title: "Convenient location",
    description: "Based in Walmer Estate, Cape Town, with clear parking guidance on request.",
    icon: trustItems[1].icon,
  },
  {
    title: "Cash practice",
    description: "Transparent fees with professional statements for medical aid claims.",
    icon: trustItems[0].icon,
  },
  {
    title: "Persistent pain focus",
    description:
      "Special interest in helping people make sense of persistent pain and return to what matters.",
    icon: trustItems[5].icon,
  },
];

function persistentPainScore(text: string) {
  const value = text.toLowerCase();
  let score = 0;
  if (value.includes("sciatica")) score += 5;
  if (value.includes("lower back") || value.includes("low back") || value.includes("back pain")) {
    score += 5;
  }
  if (value.includes("listen")) score += 3;
  if (/\bpain\b/.test(value)) score += 1;
  return score;
}

export default async function HomePage() {
  const {
    reviews: homeReviews,
    rating: homeRating,
    countLabel: homeCountLabel,
    headline: homeHeadline,
  } = await getPublicGoogleReviews(12, { featuredFirst: true });

  const leadReviews = homeReviews
    .map((review, index) => ({ review, index, score: persistentPainScore(review.content) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .map((item) => item.review);

  const previewFaqs = faqs.filter((f) => faqPreviewIds.includes(f.id));

  return (
    <>
      <Hero
        headline="Helping You Move Better, Feel Better and Live Better."
        supportingText="Evidence-based physiotherapy in Walmer Estate — with a special interest in persistent pain, helping you make sense of symptoms, restore confidence in movement, and return to what matters."
        cta={
          <div className="flex w-full flex-col items-center gap-4 tablet:items-start">
            <div className="flex w-full flex-col gap-3 tablet:w-auto tablet:flex-row">
              <Button asChild size="lg">
                <Link href={routes.booking.root}>Book appointment</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  WhatsApp us
                </a>
              </Button>
            </div>
            <p className="text-sm font-medium text-foreground">
              <Link href={routes.marketing.reviews} className="inline-flex min-h-11 items-center hover:text-accent">
                ★ {siteConfig.googleBusiness.rating.toFixed(1)} · {siteConfig.googleBusiness.reviewCount} Google reviews · HPCSA-registered physiotherapist
              </Link>
            </p>
          </div>
        }
        media={
          <FadeIn className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/15 via-accent-soft/40 to-transparent blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[1.75rem] shadow-soft-lg">
              <Image
                src={siteConfig.images.hero}
                alt="Physiotherapy care at Fouza Physiotherapy"
                width={900}
                height={1100}
                className="aspect-[4/5] w-full object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            </div>
          </FadeIn>
        }
      />

      <Section spacing="sm" tone="muted" className="py-10 md:py-16">
        <Container>
          <div className="grid grid-cols-1 gap-2.5 min-[640px]:grid-cols-2 min-[640px]:gap-3 md:gap-4 lg:grid-cols-3">
            {trustItems.map((item) => (
              <SlideUp key={item.title}>
                <FeatureCard
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  titleAs="p"
                  rowOnNarrow
                />
              </SlideUp>
            ))}
          </div>
        </Container>
      </Section>

      <ServicesCoverflow
        eyebrow="Services"
        title="Understanding your pain. Restoring your movement. Helping you get back to life."
        description="Physiotherapy for persistent pain—so you can get back to living your life."
        services={services}
      />

      <MeetFouza
        eyebrow="Meet Fouza"
        title="Your physiotherapist"
        description="Fouza Abrahams founded the practice to deliver scientific, client-centred rehabilitation with warmth and clarity."
        media={
          <div className="overflow-hidden rounded-[1.75rem] shadow-soft">
            <Image
              src={siteConfig.images.portrait}
              alt={siteConfig.founder.name}
              width={800}
              height={1000}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        }
      >
        <DoctorCard
          name={siteConfig.founder.name}
          title={siteConfig.founder.title}
          credentials={[
            siteConfig.founder.credentials,
            "HPCSA Registered",
            "Private practice since 2021",
          ]}
          bio="Special interest in persistent pain — helping people make sense of their pain, restore confidence in movement, and return to the activities that matter most."
          cta={
            <Button asChild variant="outline">
              <Link href={routes.marketing.meetFouza}>Meet your physiotherapist</Link>
            </Button>
          }
        />
      </MeetFouza>

      <Section spacing="md" className="md:hidden">
        <Container>
          <SectionHeader
            eyebrow="Conditions"
            title="Conditions we commonly treat"
            description="Dedicated guidance for the concerns that bring people through our door."
          />
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {conditions.map((condition) => (
              <Link
                key={condition.slug}
                href={routes.marketing.condition(condition.slug)}
                className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground"
              >
                {condition.name}
              </Link>
            ))}
          </div>
          <Link
            href={routes.marketing.conditions}
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent"
          >
            View all conditions
          </Link>
        </Container>
      </Section>

      <ConditionsGrid
        className="hidden md:block"
        eyebrow="Conditions"
        title="Conditions we commonly treat"
        description="Dedicated guidance for the concerns that bring people through our door."
      >
        {conditions.slice(0, 9).map((condition) => (
          <ServiceCard
            key={condition.slug}
            title={condition.name}
            description={condition.summary}
            href={routes.marketing.condition(condition.slug)}
          />
        ))}
      </ConditionsGrid>

      <WhyChooseUs
        className="hidden md:block"
        eyebrow="Why Fouza Physiotherapy"
        title="Calm, modern care you can trust"
        description="Professional physiotherapy that’s thoughtful, evidence-based, and focused on helping you move with confidence."
      >
        {whyChoose.map((item) => (
          <FeatureCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
          />
        ))}
      </WhyChooseUs>

      <Section spacing="md">
        <Container size="lg">
          <SectionHeader
            eyebrow="Patient journey"
            title="A clear path from booking to recovery"
            description="Every step is designed to reduce uncertainty and support lasting results."
          />
          <Timeline items={journey} />
        </Container>
      </Section>

      <GoogleReviewsSection
        eyebrow="Testimonials"
        title="What patients say"
        description="Real Google reviews from patients at Fouza Physiotherapy."
        ratingSummary={
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <ReviewSummary
              rating={homeRating}
              headline={homeHeadline}
              countLabel={homeCountLabel}
            />
            <LeaveReviewButton />
          </div>
        }
      >
        <FeaturedReviews reviews={leadReviews} className="md:col-span-2 lg:col-span-2" />
      </GoogleReviewsSection>

      <FaqPreview
        eyebrow="FAQs"
        title="Questions patients ask often"
        description="Quick answers before your first visit."
        footer={
          <Button asChild variant="outline">
            <Link href={routes.marketing.faq}>View all FAQs</Link>
          </Button>
        }
      >
        <FaqAccordion
          items={previewFaqs.map((item) => ({
            id: item.id,
            question: item.question,
            answer: item.answer,
          }))}
        />
      </FaqPreview>

      <BookingCta
        title="Ready to start your recovery?"
        description={`Book online, or message us first. ${siteConfig.address} · ${siteConfig.hoursSummary}`}
      >
        <Button asChild size="lg">
          <Link href={routes.booking.root}>Book appointment</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
            WhatsApp us
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={routes.marketing.contact}>Contact us</Link>
        </Button>
      </BookingCta>
    </>
  );
}
