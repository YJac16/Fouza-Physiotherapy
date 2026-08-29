import { Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";

import { PageHero } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { siteConfig, telHref } from "@/config/site";
import { BookingWizard, listBookableCatalog } from "@/features/booking";
import { loadBookingConsentFormsAction } from "@/features/booking/actions/booking";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Book an Appointment | Fouza Physiotherapy",
  description:
    "Book your physiotherapy appointment at Fouza Physiotherapy in Walmer Estate, Cape Town online, or contact us on WhatsApp or phone.",
  path: routes.booking.root,
});

const alternativeContact = [
  {
    icon: MessageCircle,
    label: "WhatsApp us",
    value: "Message us directly",
    href: siteConfig.whatsappUrl,
  },
  {
    icon: Phone,
    label: "Call us",
    value: siteConfig.phoneDisplay,
    href: telHref(),
  },
  {
    icon: Mail,
    label: "Email us",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
];

function BookingUnavailableCta() {
  return (
    <div className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent-soft/40 p-8 text-center shadow-soft tablet:p-12">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Phone className="size-7" aria-hidden />
      </div>
      <Typography as="h2" variant="h2" className="mt-6 text-balance">
        Online booking is temporarily unavailable
      </Typography>
      <Typography variant="body-lg" className="mx-auto mt-3 max-w-lg">
        Please contact the practice to schedule your appointment. We&apos;ll confirm a suitable time
        with you shortly.
      </Typography>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
            WhatsApp us
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a href={telHref()}>Call {siteConfig.phoneDisplay}</a>
        </Button>
      </div>
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
        <div className="grid gap-4 tablet:grid-cols-3">
          {alternativeContact.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="overflow-hidden shadow-sm">
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
                    <div className="min-w-0 flex-1">
                      <Typography as="p" variant="h5" className="text-sm break-words">
                        {item.label}
                      </Typography>
                      <Typography variant="small" className="mt-0.5 break-words">
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
  let patientContext: Awaited<ReturnType<typeof listBookableCatalog>>["patientContext"] = null;
  let bookablePatients: Awaited<ReturnType<typeof listBookableCatalog>>["bookablePatients"] = [];
  let isAuthenticated = false;
  let consentForms: Awaited<ReturnType<typeof loadBookingConsentFormsAction>>["forms"] = null;

  try {
    const catalog = await listBookableCatalog();
    services = catalog.services;
    practitioners = catalog.practitioners;
    patientContext = catalog.patientContext;
    bookablePatients = catalog.bookablePatients;
    isAuthenticated = catalog.isAuthenticated;
    catalogAvailable = services.length > 0 && practitioners.length > 0;

    if (catalogAvailable) {
      const formsResult = await loadBookingConsentFormsAction();
      consentForms = formsResult.forms;
    }
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
        description="Choose a convenient time online, or reach us on WhatsApp or phone — we're here to help you take the first step towards recovery."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Book Appointment" },
        ]}
      />

      {catalogAvailable ? (
        <Section spacing="md">
          <Container size="md">
            <BookingWizard
              services={services}
              practitioners={practitioners}
              patientContext={patientContext}
              bookablePatients={bookablePatients}
              isAuthenticated={isAuthenticated}
              consentForms={consentForms}
            />
          </Container>
        </Section>
      ) : (
        <Section spacing="md">
          <Container size="md">
            <BookingUnavailableCta />
          </Container>
        </Section>
      )}

      <AlternativeContactSection />
    </>
  );
}
