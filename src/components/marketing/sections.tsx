import type { HTMLAttributes, ReactNode } from "react";

import { Container, Section, SectionHeader } from "@/components/layout/container";
import { cn } from "@/lib/utils";

/* ── Hero ── */

export interface HeroProps extends HTMLAttributes<HTMLElement> {
  headline: string;
  supportingText: string;
  cta?: ReactNode;
  media?: ReactNode;
}

export function Hero({
  headline,
  supportingText,
  cta,
  media,
  className,
  ...props
}: HeroProps) {
  return (
    <Section
      tone="hero"
      spacing="lg"
      className={cn("relative overflow-hidden", className)}
      aria-labelledby="hero-headline"
      {...props}
    >
      <Container>
        <div className="grid items-center gap-10 tablet:grid-cols-2 tablet:gap-12">
          <div className="mx-auto max-w-xl space-y-6 text-center tablet:mx-0 tablet:text-left">
            <h1
              id="hero-headline"
              className="font-display text-display text-balance tracking-tight text-foreground"
            >
              {headline}
            </h1>
            <p className="text-body-lg text-balance text-muted-foreground">
              {supportingText}
            </p>
            {cta ? (
              <div className="flex flex-col items-center gap-3 sm:flex-row tablet:justify-start">
                {cta}
              </div>
            ) : null}
          </div>
          {media ? (
            <div className="relative mx-auto w-full max-w-lg tablet:max-w-none">
              {media}
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

/* ── ServicesGrid ── */

export interface ServicesGridProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function ServicesGrid({
  eyebrow,
  title,
  description,
  children,
  className,
  ...props
}: ServicesGridProps) {
  return (
    <Section spacing="md" className={className} {...props}>
      <Container>
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <div className="grid gap-6 tablet:grid-cols-2 lg:grid-cols-3">{children}</div>
      </Container>
    </Section>
  );
}

/* ── MeetFouza ── */

export interface MeetFouzaProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  media?: ReactNode;
}

export function MeetFouza({
  eyebrow,
  title,
  description,
  children,
  media,
  className,
  ...props
}: MeetFouzaProps) {
  return (
    <Section spacing="md" tone="muted" className={className} {...props}>
      <Container>
        <div className="grid items-center gap-10 tablet:grid-cols-2 tablet:gap-16">
          {media ? (
            <div className="order-2 tablet:order-1">{media}</div>
          ) : null}
          <div className={cn("order-1 space-y-6", media && "tablet:order-2")}>
            <SectionHeader
              eyebrow={eyebrow}
              title={title}
              description={description}
              className="mb-0"
            />
            {children}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ── ConditionsGrid ── */

export interface ConditionsGridProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function ConditionsGrid({
  eyebrow,
  title,
  description,
  children,
  className,
  ...props
}: ConditionsGridProps) {
  return (
    <Section spacing="md" className={className} {...props}>
      <Container>
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <div className="grid gap-4 tablet:grid-cols-2 lg:grid-cols-3">{children}</div>
      </Container>
    </Section>
  );
}

/* ── WhyChooseUs ── */

export interface WhyChooseUsProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function WhyChooseUs({
  eyebrow,
  title,
  description,
  children,
  className,
  ...props
}: WhyChooseUsProps) {
  return (
    <Section spacing="md" tone="soft" className={className} {...props}>
      <Container>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
          className="mx-auto"
        />
        <div className="grid gap-6 tablet:grid-cols-2 lg:grid-cols-3">{children}</div>
      </Container>
    </Section>
  );
}

/* ── PatientJourney ── */

export interface PatientJourneyProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function PatientJourney({
  eyebrow,
  title,
  description,
  children,
  className,
  ...props
}: PatientJourneyProps) {
  return (
    <Section spacing="md" className={className} {...props}>
      <Container size="lg">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        {children}
      </Container>
    </Section>
  );
}

/* ── Testimonials ── */

export interface TestimonialsProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Testimonials({
  eyebrow,
  title,
  description,
  children,
  className,
  ...props
}: TestimonialsProps) {
  return (
    <Section spacing="md" tone="muted" className={className} {...props}>
      <Container>
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
          className="mx-auto"
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>
      </Container>
    </Section>
  );
}

/* ── GoogleReviewsSection ── */

export interface GoogleReviewsSectionProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  ratingSummary?: ReactNode;
  children: ReactNode;
}

export function GoogleReviewsSection({
  eyebrow,
  title,
  description,
  ratingSummary,
  children,
  className,
  ...props
}: GoogleReviewsSectionProps) {
  return (
    <Section spacing="md" className={className} {...props}>
      <Container>
        <div className="mb-10 flex flex-col gap-6 tablet:flex-row tablet:items-end tablet:justify-between">
          <SectionHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            className="mb-0"
          />
          {ratingSummary ? <div className="shrink-0">{ratingSummary}</div> : null}
        </div>
        <div className="grid gap-6 md:grid-cols-2">{children}</div>
      </Container>
    </Section>
  );
}

/* ── FaqPreview ── */

export interface FaqPreviewProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function FaqPreview({
  eyebrow,
  title,
  description,
  children,
  footer,
  className,
  ...props
}: FaqPreviewProps) {
  return (
    <Section spacing="md" tone="soft" className={className} {...props}>
      <Container size="md">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <div className="mx-auto max-w-2xl">{children}</div>
        {footer ? <div className="mt-8 flex justify-center">{footer}</div> : null}
      </Container>
    </Section>
  );
}

/* ── BookingCta ── */

export interface BookingCtaProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  children: ReactNode;
}

export function BookingCta({
  title,
  description,
  children,
  className,
  ...props
}: BookingCtaProps) {
  return (
    <Section spacing="md" className={className} {...props}>
      <Container size="md">
        <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent-soft/40 p-8 text-center shadow-soft tablet:p-12">
          <h2 className="font-display text-h2 text-balance tracking-tight text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="mx-auto mt-3 max-w-lg text-body-lg text-muted-foreground">
              {description}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {children}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ── ContactCta ── */

export interface ContactCtaProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ContactCta({
  title,
  description,
  children,
  className,
  ...props
}: ContactCtaProps) {
  return (
    <Section spacing="md" tone="muted" className={className} {...props}>
      <Container>
        <div className="grid gap-8 tablet:grid-cols-2 tablet:items-center">
          <div className="space-y-3">
            <h2 className="font-display text-h2 tracking-tight text-foreground">{title}</h2>
            {description ? (
              <p className="text-body-lg text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-4">{children}</div>
        </div>
      </Container>
    </Section>
  );
}
