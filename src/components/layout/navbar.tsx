"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types/auth";

const navLinks = [
  { label: "Home", href: routes.marketing.home },
  { label: "About", href: routes.marketing.about },
  { label: "Meet Fouza", href: routes.marketing.meetFouza },
  { label: "Services", href: routes.marketing.services },
  { label: "Conditions", href: routes.marketing.conditions },
  { label: "Pricing", href: routes.marketing.pricing },
  { label: "Blog", href: routes.marketing.blog },
  { label: "FAQs", href: routes.marketing.faq },
  { label: "Contact", href: routes.marketing.contact },
];

const STAFF_ROLES: AppRole[] = ["admin", "practitioner", "receptionist"];

export interface NavbarProps {
  className?: string;
  ctaHref?: string;
  ctaLabel?: string;
  /** When set, replace the guest "Sign in" link with the account home. */
  auth?: {
    role: AppRole;
  } | null;
}

function accountLink(role: AppRole) {
  if (STAFF_ROLES.includes(role)) {
    return { href: routes.admin.root, label: "Admin" };
  }
  return { href: routes.portal.root, label: "My portal" };
}

export function Navbar({
  className,
  ctaHref = routes.booking.root,
  ctaLabel = "Book appointment",
  auth = null,
}: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const account = auth ? accountLink(auth.role) : null;

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-220 ease-premium",
        scrolled
          ? "border-b border-border/70 bg-background/85 shadow-sm backdrop-blur-xl"
          : "border-b border-transparent bg-background/70 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-6 lg:px-8">
        <Logo
          href={routes.marketing.home}
          size="md"
          className="h-9 max-w-[11rem] md:h-11 md:max-w-[14rem]"
        />

        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          {account ? (
            <Link
              href={account.href}
              className="rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {account.label}
            </Link>
          ) : (
            <Link
              href={routes.auth.login}
              className="rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Sign in
            </Link>
          )}
          <Button asChild size="sm">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 xl:hidden">
          <ThemeToggle />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border/70 bg-background xl:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-4">
              <Button asChild className="w-full">
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href={account?.href ?? routes.auth.login}>
                  {account?.label ?? "Sign in"}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
