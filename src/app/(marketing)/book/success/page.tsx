import Link from "next/link";
import type { Metadata } from "next";

import { ConfirmationCard } from "@/components/booking";
import { TrackBookingCompleted } from "@/components/analytics/marketing-tracker";
import { PageHero } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { cancellationPolicyNotice } from "@/content/pricing";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { loadBookingConfirmationSummary } from "@/features/booking/lib/confirmation";
import { getSessionProfile } from "@/lib/auth/guards";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { createHash } from "crypto";

export const metadata: Metadata = buildMetadata({
  title: "Booking Confirmed | Fouza Physiotherapy",
  description:
    "Your physiotherapy appointment at Fouza Physiotherapy has been confirmed. Access your patient portal to manage your visit.",
  path: routes.booking.success,
  noIndex: true,
});

interface BookSuccessPageProps {
  searchParams: Promise<{ id?: string; token?: string }>;
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(cents: number | null, currency: string) {
  if (cents == null) return null;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function BookSuccessPage({ searchParams }: BookSuccessPageProps) {
  const { id, token } = await searchParams;
  const profile = await getSessionProfile();
  const isSignedInPatient = profile?.role === "patient";

  const summary = await loadBookingConfirmationSummary({
    token: token ?? undefined,
    appointmentId: !token ? id : undefined,
  });

  const hashedBookingId = summary?.bookingReference
    ? createHash("sha256").update(summary.bookingReference).digest("hex").slice(0, 16)
    : token
      ? createHash("sha256").update(token).digest("hex").slice(0, 16)
      : undefined;

  const registerHref = `${routes.auth.register}?redirectTo=${encodeURIComponent(routes.portal.appointments)}`;

  return (
    <>
      <TrackBookingCompleted transactionId={hashedBookingId} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Book Appointment", path: routes.booking.root },
          { name: "Confirmed", path: routes.booking.success },
        ])}
      />

      <PageHero
        title="You're booked in"
        description="Thank you for choosing Fouza Physiotherapy. We look forward to seeing you."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Book Appointment", href: routes.booking.root },
          { label: "Confirmed" },
        ]}
      />

      <Section spacing="md">
        <Container size="md">
          {!summary ? (
            <ConfirmationCard
              title="Booking confirmation"
              message="We couldn't load this confirmation. If you just completed a booking, check your email for details or sign in to your portal."
              details={[
                { label: "Practice", value: siteConfig.practiceName },
                { label: "Location", value: siteConfig.addressShort },
              ]}
              actions={
                <div className="flex w-full flex-col gap-3">
                  <Button asChild size="lg" className="w-full">
                    <Link href={routes.auth.login}>Sign in to portal</Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href={routes.booking.root}>Book another appointment</Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <ConfirmationCard
              title="Appointment confirmed"
              message="We've received your booking. A confirmation email is on its way."
              reference={summary.bookingReference ?? undefined}
              details={[
                { label: "Service", value: summary.serviceName },
                { label: "When", value: formatWhen(summary.startsAt) },
                { label: "Customer", value: summary.patientName },
                ...(summary.patientEmail
                  ? [{ label: "Email", value: summary.patientEmail }]
                  : []),
                {
                  label: "Consent",
                  value: summary.consentCompleted ? "Completed" : "Pending",
                },
                ...(summary.consentVersion
                  ? [{ label: "Consent version", value: summary.consentVersion }]
                  : []),
                {
                  label: "Payment",
                  value: "Due at practice (cash, card, or EFT)",
                },
                ...(formatPrice(summary.priceCents, summary.currency)
                  ? [{ label: "Session fee", value: formatPrice(summary.priceCents, summary.currency)! }]
                  : []),
                { label: "Practice", value: siteConfig.practiceName },
                { label: "Location", value: siteConfig.addressShort },
              ]}
              actions={
                <div className="flex w-full flex-col gap-3">
                  <Typography variant="small" className="text-center text-muted-foreground">
                    {cancellationPolicyNotice}
                  </Typography>
                  {isSignedInPatient ? (
                    <>
                      <Button asChild size="lg" className="w-full">
                        <Link href={routes.portal.appointments}>View my appointments</Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full">
                        <Link href={routes.portal.root}>Back to portal</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="small" className="text-center text-muted-foreground">
                        Optional: create an account to manage appointments online, or continue as a
                        guest — your booking is already confirmed.
                      </Typography>
                      <Button asChild size="lg" className="w-full">
                        <Link href={registerHref}>Create account</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={routes.auth.login}>Sign in</Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full">
                        <Link href={routes.marketing.home}>Continue without account</Link>
                      </Button>
                    </>
                  )}
                </div>
              }
            />
          )}
        </Container>
      </Section>
    </>
  );
}
