import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Newsletter } from "@/components/shared/newsletter";
import { Separator } from "@/components/ui/separator";
import { routes } from "@/config/routes";
import { mapsQueryUrl, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const explore = [
  { label: "Home", href: routes.marketing.home },
  { label: "About", href: routes.marketing.about },
  { label: "Meet Fouza", href: routes.marketing.meetFouza },
  { label: "Services", href: routes.marketing.services },
  { label: "Conditions", href: routes.marketing.conditions },
  { label: "Pricing", href: routes.marketing.pricing },
];

const care = [
  { label: "Book appointment", href: routes.booking.root },
  { label: "FAQs", href: routes.marketing.faq },
  { label: "Blog", href: routes.marketing.blog },
  { label: "Contact", href: routes.marketing.contact },
  { label: "Reviews", href: routes.marketing.reviews },
  { label: "Sign in", href: routes.auth.login },
];

const legal = [
  { label: "Privacy Policy", href: routes.marketing.privacy },
  { label: "Terms & Conditions", href: routes.marketing.terms },
];

export interface FooterProps {
  className?: string;
  showNewsletter?: boolean;
}

export function Footer({ className, showNewsletter = true }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn("border-t border-border/70 bg-secondary/40", className)}>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-4">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
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
                <Clock className="size-4 text-primary" aria-hidden />
                <span>{siteConfig.hoursSummary}</span>
              </li>
            </ul>
          </div>

          <div className="grid gap-8 tablet:grid-cols-3 lg:col-span-4">
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
              <Newsletter />
            </div>
          ) : null}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.practiceName}. All rights reserved.
          </p>
          <p>Evidence-based physiotherapy · Walmer Estate, Cape Town</p>
        </div>
      </div>
    </footer>
  );
}
