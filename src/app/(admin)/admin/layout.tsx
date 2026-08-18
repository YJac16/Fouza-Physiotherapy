import { AdminShell } from "@/components/layout/admin-shell";
import { requireStaff } from "@/lib/auth/guards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStaff();
  const userName = profile.full_name ?? profile.email;

  return (
    <AdminShell userName={userName} role={profile.role}>
      {children}
    </AdminShell>
  );
}
