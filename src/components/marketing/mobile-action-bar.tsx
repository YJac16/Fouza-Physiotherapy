"use client";

import { Calendar, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { routes } from "@/config/routes";
import { siteConfig, telHref } from "@/config/site";
import { cn } from "@/lib/utils";

const actions = [
  { label: "Book", href: routes.booking.root, icon: Calendar, external: false },
  { label: "WhatsApp", href: siteConfig.whatsappUrl, icon: MessageCircle, external: true },
  { label: "Call", href: telHref(), icon: Phone, external: false },
] as const;

export function MobileActionBar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const hidden = pathname === "/book" || pathname.startsWith("/book/");

  useEffect(() => {
    const sync = () => {
      setMenuOpen(document.documentElement.dataset.mobileNav === "open");
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mobile-nav"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const offset = hidden ? "0px" : "4.25rem";
    document.documentElement.style.setProperty("--mobile-action-offset", offset);
    return () => {
      document.documentElement.style.removeProperty("--mobile-action-offset");
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <nav
      aria-label="Quick actions"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-soft backdrop-blur md:hidden",
        menuOpen && "hidden",
      )}
    >
      <ul className="grid grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const className =
            "flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-foreground";
          return (
            <li key={action.label}>
              {action.external ? (
                <a
                  href={action.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  <Icon className="size-4" aria-hidden />
                  {action.label}
                </a>
              ) : (
                <Link href={action.href} className={className}>
                  <Icon className="size-4" aria-hidden />
                  {action.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
