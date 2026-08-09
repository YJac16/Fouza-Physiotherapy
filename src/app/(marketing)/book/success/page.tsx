import Link from "next/link";
import type { Metadata } from "next";

import { ConfirmationCard } from "@/components/booking";
import { PageHero } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { getSessionProfile } from "@/lib/auth/guards";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Booking Confirmed | Fouza Physiotherapy",
  description:
    "Your physiotherapy appointment at Fouza Physiotherapy has been confirmed. Access your patient portal to manage your visit.",
  path: routes.booking.success,
  noIndex: true,
});

interface BookSuccessPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function BookSuccessPage({ searchParams }: BookSuccessPageProps) {
  const { id } = await searchParams;
  const profile = await getSessionProfile();
  const isSignedInPatient = profile?.role === "patient";

  return (
    <>
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
          <ConfirmationCard
            title="Appointment confirmed"
            message={
              isSignedInPatient
                ? "We've received your booking. A confirmation email is on its way. You can manage this appointment anytime in your patient portal."
                : "We've received your booking. A confirmation email is on its way. Sign in to your patient portal to view and manage your appointment."
            }
            reference={id}
            details={[
              { label: "Practice", value: siteConfig.practiceName },
              { label: "Location", value: siteConfig.addressShort },
            ]}
            actions={
              <div className="flex w-full flex-col gap-3">
                {isSignedInPatient ? (
                  <>
                    <Typography variant="small" className="text-center text-muted-foreground">
                      Your account is ready — no further forms are needed for this booking.
                    </Typography>
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
                      Use the same email you booked with to sign in and view your appointment.
                    </Typography>
                    <Button asChild size="lg" className="w-full">
                      <Link href={routes.auth.login}>Sign in to portal</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full">
                      <Link href={routes.marketing.home}>Back to home</Link>
                    </Button>
                  </>
                )}
              </div>
            }
          />
        </Container>
      </Section>
    </>
  );
}
