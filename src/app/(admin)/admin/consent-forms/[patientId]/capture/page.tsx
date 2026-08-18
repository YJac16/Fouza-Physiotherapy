import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PortalFormsClient } from "@/app/(portal)/portal/forms/portal-forms-client";
import { listConsentForms, submitStaffConsentPackageAction } from "@/features/consent-forms/actions/consent";
import {
  getPatientConsentCompletionAdmin,
  INTAKE_SLUG,
} from "@/features/consent-forms/lib/completion";
import { getSignedConsentPackageAdmin } from "@/features/consent-forms/lib/signed-package";
import { getPatient, listPatientContacts } from "@/features/patients/api/patients";
import { routes } from "@/config/routes";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ patientId: string }> };

function splitPostalAddress(postal: string | null | undefined) {
  if (!postal) return { street: "", suburb: "", areaCode: "" };
  const parts = postal.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 3) {
    return {
      street: parts.slice(0, -2).join(", "),
      suburb: parts[parts.length - 2] ?? "",
      areaCode: parts[parts.length - 1] ?? "",
    };
  }
  if (parts.length === 2) {
    return { street: parts[0] ?? "", suburb: parts[1] ?? "", areaCode: "" };
  }
  return { street: postal, suburb: "", areaCode: "" };
}

export default async function AdminCaptureConsentPage({ params }: PageProps) {
  await requireStaff();
  const { patientId } = await params;
  const { data: patient } = await getPatient(patientId);
  if (!patient) notFound();

  const supabase = await createClient();
  const [{ data: consentForms }, { data: intakeForms }, contactsResult, completion] =
    await Promise.all([
      listConsentForms(),
      supabase.from("intake_forms").select("id, title, slug").eq("is_active", true),
      listPatientContacts(patientId),
      getPatientConsentCompletionAdmin(patientId),
    ]);

  const intakeForm =
    intakeForms?.find((f) => f.slug === INTAKE_SLUG) ?? intakeForms?.[0] ?? null;
  const treatmentConsent = consentForms?.find((f) => f.slug === "treatment-consent");
  const accountConsent = consentForms?.find((f) => f.slug === "account-responsibility");
  const alreadyComplete = patient.informed_consent_signed || completion.complete;
  const signedPackage = alreadyComplete ? await getSignedConsentPackageAdmin(patientId) : null;
  const accountHolder = (contactsResult.data ?? []).find((contact) => contact.is_account_holder);
  const postalParts = splitPostalAddress(patient.postal_address);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Capture informed consent</h1>
          <p className="text-sm text-muted-foreground">
            {patient.first_name} {patient.last_name} — complete this on your tablet at the visit.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={routes.admin.patient(patientId)}>Back to patient</Link>
        </Button>
      </div>

      {intakeForm && treatmentConsent && accountConsent ? (
        <PortalFormsClient
          patientId={patient.id}
          alreadyComplete={alreadyComplete}
          signedPackage={signedPackage}
          intakeForm={intakeForm}
          treatmentConsent={treatmentConsent}
          accountConsent={accountConsent}
          mode="staff"
          submitAction={submitStaffConsentPackageAction}
          returnTo={routes.admin.patient(patientId)}
          defaults={{
            fullName: `${patient.first_name} ${patient.last_name}`.trim(),
            email: patient.email ?? undefined,
            phone: patient.phone ?? undefined,
            idNumber: patient.id_number ?? undefined,
            street: postalParts.street || undefined,
            suburb: postalParts.suburb || undefined,
            areaCode: postalParts.areaCode || undefined,
            medicalAid: patient.medical_aid_name ?? undefined,
            medicalAidNumber: patient.medical_aid_number ?? undefined,
            dependantCode: patient.medical_aid_dependant_code ?? undefined,
            accountHolderName: patient.billing_name ?? accountHolder?.full_name ?? undefined,
            accountHolderEmail: patient.billing_email ?? accountHolder?.email ?? undefined,
            accountHolderPhone: patient.billing_phone ?? accountHolder?.phone ?? undefined,
            accountHolderAddress: patient.billing_address ?? undefined,
          }}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          The informed consent package is not published yet.
        </p>
      )}
    </div>
  );
}
