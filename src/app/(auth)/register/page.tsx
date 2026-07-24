import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Create account",
  description: "Create a Fouza Physiotherapy patient account.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-soft">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Create account
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Register as a patient to manage appointments and programmes.
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </div>
  );
}
