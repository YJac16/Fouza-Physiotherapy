import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Create account",
  description: "Create a Fouza Physiotherapy patient account.",
  path: "/register",
  noIndex: true,
});

export default async function RegisterPage({
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
      <h1 className="font-display text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Register as a patient to manage appointments and programmes.
      </p>
      <div className="mt-6">
        <RegisterForm redirectTo={safeRedirect} />
      </div>
    </div>
  );
}
