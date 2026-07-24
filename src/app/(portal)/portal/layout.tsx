import { PortalShell } from "@/components/layout/portal-shell";
import { requireUser } from "@/lib/auth/guards";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUser();
  const userName = profile.full_name ?? profile.email;

  return <PortalShell userName={userName}>{children}</PortalShell>;
}
