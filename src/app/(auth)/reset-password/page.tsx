import type { Metadata } from "next";

import { ResetPasswordForm } from "@/features/auth";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Reset password",
  description: "Choose a new password for your account.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-soft">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Reset password
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter a new password for your account.
      </p>
      <div className="mt-6">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
