"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

import {
  ANALYTICS_CONSENT_KEY,
  GA_MEASUREMENT_ID,
  isGaConfigured,
  readAnalyticsConsent,
} from "@/lib/analytics/gtag";

export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    function sync() {
      setEnabled(isGaConfigured() && readAnalyticsConsent() === "granted");
    }
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("fouza-analytics-consent", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("fouza-analytics-consent", sync);
    };
  }, []);

  if (!enabled || !GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'granted'
          });
          gtag('config', '${GA_MEASUREMENT_ID}', {
            anonymize_ip: true,
            allow_google_signals: false,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </Script>
    </>
  );
}

export function notifyAnalyticsConsentChanged() {
  window.dispatchEvent(new Event("fouza-analytics-consent"));
  window.dispatchEvent(new StorageEvent("storage", { key: ANALYTICS_CONSENT_KEY }));
}
