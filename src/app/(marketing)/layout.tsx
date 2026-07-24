import { SiteShell } from "@/components/layout/site-shell";
import { SkipToContent } from "@/components/shared/skip-to-content";
import { WhatsAppFloat } from "@/components/shared/whatsapp-float";
import { JsonLd, medicalBusinessJsonLd } from "@/lib/seo/json-ld";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SkipToContent />
      <SiteShell>
        <JsonLd data={medicalBusinessJsonLd()} />
        <div id="main-content">{children}</div>
        <WhatsAppFloat />
      </SiteShell>
    </>
  );
}
