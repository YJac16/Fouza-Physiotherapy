import { CalendarCheck, MessageCircle, Phone, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig, telHref } from "@/config/site";
import { BookingWizard, listBookableCatalog } from "@/features/booking";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Book an Appointment | Fouza Physiotherapy",
  description:
    "Book your physiotherapy appointment at Fouza Physiotherapy in Walmer Estate, Cape Town online, via our scheduling partner, phone, or WhatsApp.",
  path: routes.booking.root,
});

const alternativeContact = [
  {
    icon: Phone,
    label: "Call the practice",
    value: siteConfig.phoneDisplay,
    href: telHref(),
  },
  {
    icon: MessageCircle,
    label: "WhatsApp us",
    value: "Message us directly",
    href: siteConfig.whatsappUrl,
  },
];

function SetmoreBookingCta() {
  return (
    <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent-soft/40 p-8 text-center shadow-soft tablet:p-12">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CalendarCheck className="size-7" aria-hidden />
      </div>
      <Typography as="h2" variant="h2" className="mt-6 text-balance">
        Book online via our scheduling partner
      </Typography>
      <Typography variant="body-lg" className="mx-auto mt-3 max-w-lg">
        We currently use a secure external booking system to manage appointments. Choose a service
        and time that suits you, and we&apos;ll confirm your booking shortly after.
      </Typography>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <a href={siteConfig.bookingExternalUrl} target="_blank" rel="noopener noreferrer">
            Book appointment now
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href={routes.marketing.pricing}>View pricing</Link>
        </Button>
      </div>
      <Typography variant="caption" className="mt-4 block normal-case text-muted-foreground">
        You&apos;ll be redirected to our secure booking partner in a new tab.
      </Typography>
    </div>
  );
}

function AlternativeContactSection() {
  return (
    <Section spacing="md">
      <Container size="md">
        <SectionHeader
          eyebrow="Prefer to talk first?"
          title="Reach us directly"
          description="Have a question before booking, or need a time that isn't listed online? Contact us and we'll help you find a slot."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {alternativeContact.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="shadow-sm">
                <CardContent className="p-6">
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-4"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <div>
                      <Typography as="p" variant="h5" className="text-sm">
                        {item.label}
                      </Typography>
                      <Typography variant="small" className="mt-0.5">
                        {item.value}
                      </Typography>
                    </div>
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}

export default async function BookPage() {
  let catalogAvailable = false;
  let services: Awaited<ReturnType<typeof listBookableCatalog>>["services"] = [];
  let practitioners: Awaited<ReturnType<typeof listBookableCatalog>>["practitioners"] = [];

  try {
    const catalog = await listBookableCatalog();
    services = catalog.services;
    practitioners = catalog.practitioners;
    catalogAvailable = services.length > 0 && practitioners.length > 0;
  } catch {
    catalogAvailable = false;
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Book Appointment", path: routes.booking.root },
        ])}
      />

      <PageHero
        title="Book your appointment"
        description="Choose a convenient time online, or reach out directly — we're here to help you take the first step towards recovery."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Book Appointment" },
        ]}
      />

      {catalogAvailable ? (
        <Section spacing="md">
          <Container size="md">
            <BookingWizard services={services} practitioners={practitioners} />
          </Container>
        </Section>
      ) : (
        <>
          <Section spacing="md">
            <Container size="md">
              <SetmoreBookingCta />
            </Container>
          </Section>

          <Section spacing="md" tone="muted">
            <Container size="md">
              <div className="flex items-start gap-4 rounded-2xl border border-info/20 bg-info/5 p-6">
                <Sparkles className="mt-0.5 size-6 shrink-0 text-info" aria-hidden />
                <div>
                  <Typography as="h3" variant="h5">
                    Native online booking is being enabled
                  </Typography>
                  <Typography variant="small" className="mt-2 leading-relaxed">
                    We&apos;re rolling out integrated online booking directly on this website, with
                    real-time availability and instant confirmation. Until that is fully live for all
                    services, bookings are handled securely through our external scheduling partner
                    above, or by contacting the practice directly.
                  </Typography>
                </div>
              </div>
            </Container>
          </Section>
        </>
      )}

      <AlternativeContactSection />
    </>
  );
}
