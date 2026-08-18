"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import {
  isGaConfigured,
  readAnalyticsConsent,
  writeAnalyticsConsent,
} from "@/lib/analytics/gtag";

import { notifyAnalyticsConsentChanged } from "./google-analytics";

export function AnalyticsConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isGaConfigured()) return;
    if (readAnalyticsConsent()) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  function choose(value: "granted" | "denied") {
    writeAnalyticsConsent(value);
    notifyAnalyticsConsentChanged();
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-background/95 p-4 shadow-soft-lg backdrop-blur">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use optional Google Analytics cookies to understand anonymous website use. No
          names, emails, phone numbers, or clinical details are sent. See the{" "}
          <Link href={routes.marketing.privacy} className="underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => choose("denied")}>
            Decline
          </Button>
          <Button type="button" size="sm" onClick={() => choose("granted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
