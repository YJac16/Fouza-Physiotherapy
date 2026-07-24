import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/auth";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Forgot password",
  description: "Reset your Fouza Physiotherapy account password.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-soft">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Forgot password
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;ll email you a secure link to reset your password.
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
