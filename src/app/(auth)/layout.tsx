import Link from "next/link";
import type { Metadata } from "next";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Auth route group — login, register, password reset.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-clinic-mist px-4 py-10">
      <Link
        href={routes.marketing.home}
        className="mb-6 font-display text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
      >
        {siteConfig.name}
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
