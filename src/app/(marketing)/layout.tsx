import { SiteShell } from "@/components/layout/site-shell";
import { WhatsAppFloat } from "@/components/shared/whatsapp-float";
import { InstallHint } from "@/components/pwa/install-hint";
import { AnalyticsConsentBanner } from "@/components/analytics/consent-banner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { MarketingTracker } from "@/components/analytics/marketing-tracker";
import { JsonLd, medicalBusinessJsonLd } from "@/lib/seo/json-ld";
import { getSessionProfile } from "@/lib/auth/guards";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();
  const auth = profile ? { role: profile.role } : null;

  return (
    <SiteShell auth={auth}>
      <GoogleAnalytics />
      <MarketingTracker />
      <InstallHint />
      <JsonLd data={medicalBusinessJsonLd()} />
      <div id="main-content">{children}</div>
      <WhatsAppFloat />
      <AnalyticsConsentBanner />
    </SiteShell>
  );
}
