import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

export interface SiteShellProps {
  children: ReactNode;
  className?: string;
  showNewsletter?: boolean;
  navbarCtaHref?: string;
  navbarCtaLabel?: string;
}

/** Marketing / public page chrome — Navbar + main + Footer. */
export function SiteShell({
  children,
  className,
  showNewsletter = true,
  navbarCtaHref,
  navbarCtaLabel,
}: SiteShellProps) {
  return (
    <div className={cn("flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-background", className)}>
      <Navbar ctaHref={navbarCtaHref} ctaLabel={navbarCtaLabel} />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer showNewsletter={showNewsletter} />
    </div>
  );
}
