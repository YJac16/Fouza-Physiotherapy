import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SignedConsentView } from "@/features/consent-forms/components/signed-consent-view";
import { getSignedConsentPackageAdmin } from "@/features/consent-forms/lib/signed-package";
import { routes } from "@/config/routes";
import { requireStaff } from "@/lib/auth/guards";

type PageProps = { params: Promise<{ patientId: string }> };

export default async function AdminPatientConsentPage({ params }: PageProps) {
  await requireStaff();
  const { patientId } = await params;
  const signedPackage = await getSignedConsentPackageAdmin(patientId);
  if (!signedPackage) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Signed consent</h1>
          <p className="text-sm text-muted-foreground">{signedPackage.patientName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={routes.admin.consentForms}>All consent</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.admin.patient(patientId)}>Patient record</Link>
          </Button>
        </div>
      </div>
      <SignedConsentView package={signedPackage} />
    </div>
  );
}
