"use client";

import { CheckCircle2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface NewsletterProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onSubscribe?: (email: string) => Promise<void> | void;
}

export function Newsletter({
  title = "Stay informed",
  description = "Gentle tips for recovery, movement, and wellbeing — no spam.",
  onSubscribe,
  className,
  ...props
}: NewsletterProps) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setStatus("error");
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setStatus("loading");
      await onSubscribe?.(email);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return <NewsletterSuccess className={className} {...props} />;
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="space-y-1.5">
        <p className="font-display text-h5 tracking-tight text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="space-y-2">
          <Label htmlFor="newsletter-email" className="sr-only">
            Email address
          </Label>
          <Input
            id="newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={status === "error"}
            disabled={status === "loading"}
          />
        </div>
        {error ? <FormMessage tone="error">{error}</FormMessage> : null}
        <Button type="submit" className="w-full" loading={status === "loading"}>
          Subscribe
        </Button>
      </form>
    </div>
  );
}

export function NewsletterSuccess({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-success/20 bg-success/5 p-4",
        className,
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
      <div>
        <p className="font-medium text-foreground">You&apos;re subscribed</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Thank you — we&apos;ll share thoughtful updates when they matter.
        </p>
      </div>
    </div>
  );
}
