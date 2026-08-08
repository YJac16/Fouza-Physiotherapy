import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/types/auth";

export interface SiteShellProps {
  children: ReactNode;
  className?: string;
  showNewsletter?: boolean;
  navbarCtaHref?: string;
  navbarCtaLabel?: string;
  auth?: { role: AppRole } | null;
}

/** Marketing / public page chrome — Navbar + main + Footer. */
export function SiteShell({
  children,
  className,
  showNewsletter = true,
  navbarCtaHref,
  navbarCtaLabel,
  auth = null,
}: SiteShellProps) {
  return (
    <div className={cn("flex min-h-screen min-w-0 flex-col overflow-x-hidden bg-background", className)}>
      <Navbar ctaHref={navbarCtaHref} ctaLabel={navbarCtaLabel} auth={auth} />
      <main className="min-w-0 flex-1">{children}</main>
      <Footer showNewsletter={showNewsletter} auth={auth} />
    </div>
  );
}
