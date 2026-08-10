import { SiteShell } from "@/components/layout/site-shell";
import { WhatsAppFloat } from "@/components/shared/whatsapp-float";
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
      <JsonLd data={medicalBusinessJsonLd()} />
      <div id="main-content">{children}</div>
      <WhatsAppFloat />
    </SiteShell>
  );
}
