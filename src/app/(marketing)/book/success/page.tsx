import Link from "next/link";
import type { Metadata } from "next";

import { ConfirmationCard } from "@/components/booking";
import { PageHero } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Booking Confirmed | Fouza Physiotherapy",
  description:
    "Your physiotherapy appointment at Fouza Physiotherapy has been confirmed. Complete your patient intake and access your portal.",
  path: routes.booking.success,
  noIndex: true,
});

interface BookSuccessPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function BookSuccessPage({ searchParams }: BookSuccessPageProps) {
  const { id } = await searchParams;

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
            message="We've received your booking and sent a confirmation to your email. Please arrive a few minutes early for your first visit."
            reference={id}
            details={[
              { label: "Practice", value: siteConfig.practiceName },
              { label: "Location", value: siteConfig.addressShort },
            ]}
            actions={
              <div className="flex w-full flex-col gap-3">
                <Typography variant="small" className="text-center text-muted-foreground">
                  Save time before your visit by completing your intake forms and creating a patient
                  portal account.
                </Typography>
                <Button asChild size="lg" className="w-full">
                  <Link href={routes.auth.register}>Create portal account</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href={routes.auth.login}>Sign in to portal</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="w-full">
                  <Link href={routes.portal.forms}>Complete intake forms</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href={routes.marketing.home}>Back to home</Link>
                </Button>
              </div>
            }
          />
        </Container>
      </Section>
    </>
  );
}
