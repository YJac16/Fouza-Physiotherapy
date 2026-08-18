import { PortalShell } from "@/components/layout/portal-shell";
import { getPortalView } from "@/features/patients/api/patients";
import { requireUser } from "@/lib/auth/guards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireUser();
  const { patients, selected } = await getPortalView();
  const userName = profile.full_name ?? profile.email;

  return (
    <PortalShell
      userName={userName}
      patients={patients}
      selectedPatientId={selected?.id ?? null}
    >
      {children}
    </PortalShell>
  );
}
