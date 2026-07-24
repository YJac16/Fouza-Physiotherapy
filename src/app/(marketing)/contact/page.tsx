import { AlertTriangle, Car, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";

import { ContactForm, PageHero } from "@/components/marketing";
import { Container, Section, SectionHeader } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/config/routes";
import { mapsQueryUrl, siteConfig, telHref } from "@/config/site";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us | Fouza Physiotherapy",
  description:
    "Get in touch with Fouza Physiotherapy in Walmer Estate, Cape Town — call, WhatsApp, email, or send us a message.",
  path: routes.marketing.contact,
});

const contactDetails = [
  {
    icon: MapPin,
    label: "Address",
    value: siteConfig.address,
    href: mapsQueryUrl(),
    external: true,
  },
  {
    icon: Phone,
    label: "Phone",
    value: siteConfig.phoneDisplay,
    href: telHref(),
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Message us directly",
    href: siteConfig.whatsappUrl,
    external: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: routes.marketing.home },
          { name: "Contact", path: routes.marketing.contact },
        ])}
      />

      <PageHero
        title="Get in touch"
        description="Questions about booking, pricing, or whether we can help with your concern? Reach out — we respond quickly."
        breadcrumbs={[
          { label: "Home", href: routes.marketing.home },
          { label: "Contact" },
        ]}
      />

      <Section spacing="md">
        <Container>
          <div className="grid gap-10 tablet:grid-cols-[minmax(0,340px)_1fr] tablet:gap-16">
            <div className="space-y-6">
              <div className="space-y-3">
                {contactDetails.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-colors hover:border-primary/25 hover:bg-secondary/40"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-soft-foreground">
                        <Icon className="size-4" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <Typography variant="caption">{item.label}</Typography>
                        <Typography as="p" variant="body" className="mt-0.5 break-words font-medium">
                          {item.value}
                        </Typography>
                      </div>
                    </a>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="size-4 text-primary" aria-hidden />
                  <Typography as="h3" variant="h5" className="text-sm">
                    Opening hours
                  </Typography>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {siteConfig.hours.map((day) => (
                    <li key={day.day} className="flex items-center justify-between gap-4">
                      <span>{day.day}</span>
                      <span className="font-medium text-foreground">
                        {day.opens && day.closes ? `${day.opens} – ${day.closes}` : "Closed"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
                <Car className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <Typography as="p" variant="h5" className="text-sm">
                    Parking
                  </Typography>
                  <Typography variant="small" className="mt-1 leading-relaxed">
                    Street parking is available near the practice on Upper
                    Duke Street. Please allow a few extra minutes to park
                    before your appointment.
                  </Typography>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-warning/25 bg-warning/10 p-5">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning-foreground" aria-hidden />
                <div>
                  <Typography as="p" variant="h5" className="text-sm">
                    Medical emergency?
                  </Typography>
                  <Typography variant="small" className="mt-1 leading-relaxed">
                    Fouza Physiotherapy is not an emergency service. If you
                    are experiencing a medical emergency, please call your
                    local emergency services or go to your nearest emergency
                    room immediately.
                  </Typography>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="overflow-hidden rounded-2xl border border-border/80 shadow-sm">
                <a
                  href={mapsQueryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-3 bg-secondary/60 text-center transition-colors hover:bg-secondary"
                >
                  <MapPin className="size-8 text-primary" aria-hidden />
                  <div>
                    <Typography as="p" variant="h5">
                      {siteConfig.addressShort}
                    </Typography>
                    <Typography variant="small" className="mt-1">
                      Tap to open in Google Maps
                    </Typography>
                  </div>
                </a>
              </div>

              <div>
                <SectionHeader
                  eyebrow="Send a message"
                  title="We'll get back to you shortly"
                  description="For urgent enquiries, please call or WhatsApp us directly."
                  className="mb-6"
                />
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
