import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Newsletter } from "@/components/shared/newsletter";
import { RegistrationDetails } from "@/components/marketing/registration-details";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/config/routes";
import { mapsQueryUrl, siteConfig, telHref } from "@/config/site";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types/auth";

const explore = [
  { label: "Home", href: routes.marketing.home },
  { label: "About", href: routes.marketing.about },
  { label: "Meet Fouza", href: routes.marketing.meetFouza },
  { label: "Services", href: routes.marketing.services },
  { label: "Conditions", href: routes.marketing.conditions },
  { label: "Pricing", href: routes.marketing.pricing },
];

const legal = [
  { label: "Privacy Policy", href: routes.marketing.privacy },
  { label: "Terms & Conditions", href: routes.marketing.terms },
];

const STAFF_ROLES: AppRole[] = ["admin", "practitioner", "receptionist"];

export interface FooterProps {
  className?: string;
  showNewsletter?: boolean;
  auth?: { role: AppRole } | null;
}

export function Footer({ className, showNewsletter = true, auth = null }: FooterProps) {
  const year = new Date().getFullYear();
  const account =
    auth == null
      ? { label: "Sign in", href: routes.auth.login }
      : STAFF_ROLES.includes(auth.role)
        ? { label: "Admin", href: routes.admin.root }
        : { label: "My portal", href: routes.portal.root };

  const care = [
    { label: "Book appointment", href: routes.booking.root },
    { label: "FAQs", href: routes.marketing.faq },
    { label: "Blog", href: routes.marketing.blog },
    { label: "Contact", href: routes.marketing.contact },
    { label: "Reviews", href: routes.marketing.reviews },
    account,
  ];

  return (
    <footer className={cn("border-t border-border/70 bg-secondary/40 pb-[calc(4.75rem+var(--install-hint-offset,0px)+env(safe-area-inset-bottom))] md:pb-0", className)}>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-4">
            <Logo />
            <p className="hidden max-w-sm text-sm leading-relaxed text-muted-foreground md:block">
              {siteConfig.description}
            </p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <a
                  href={mapsQueryUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  {siteConfig.address}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="size-4 text-primary" aria-hidden />
                <a
                  href={siteConfig.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-primary" aria-hidden />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-foreground">
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-primary" aria-hidden />
                <a href={telHref()} className="hover:text-foreground">
                  {siteConfig.phoneDisplay}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-4 text-primary" aria-hidden />
                <span>{siteConfig.hoursSummary}</span>
              </li>
            </ul>
            <RegistrationDetails />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-3 lg:col-span-4">
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Explore</p>
              <ul className="space-y-2">
                {explore.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Care</p>
              <ul className="space-y-2">
                {care.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Legal</p>
              <ul className="space-y-2">
                {legal.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {showNewsletter ? (
            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm md:hidden">
                <p className="font-display text-h5 tracking-tight text-foreground">Book a visit</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Choose a time online, or message us on WhatsApp.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href={routes.booking.root}>Book appointment</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href={siteConfig.whatsappUrl} target="_blank" rel="noopener noreferrer">
                      WhatsApp us
                    </a>
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <Newsletter />
              </div>
            </div>
          ) : null}
        </div>

        <Separator className="my-8 md:my-10" />

        <p className="text-xs text-muted-foreground">
          © {year} {siteConfig.practiceName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
