import type { Metadata } from "next";

import { LoginForm } from "@/features/auth";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Sign in",
  description: "Sign in to Fouza Physiotherapy patient portal or staff dashboard.",
  path: "/login",
  noIndex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : undefined;

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-soft sm:p-8">
      <h1 className="font-display text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Access your patient portal or practice dashboard.
      </p>
      <div className="mt-6">
        <LoginForm redirectTo={safeRedirect} />
      </div>
    </div>
  );
}
