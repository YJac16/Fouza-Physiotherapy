import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PortalFormsClient } from "@/app/(portal)/portal/forms/portal-forms-client";
import {
  createPatientWithStaffConsentAction,
  listConsentForms,
} from "@/features/consent-forms/actions/consent";
import { INTAKE_SLUG } from "@/features/consent-forms/lib/completion";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export default async function NewPatientPage() {
  await requireStaff();

  const supabase = await createClient();
  const [{ data: consentForms }, { data: intakeForms }] = await Promise.all([
    listConsentForms(),
    supabase.from("intake_forms").select("id, title, slug").eq("is_active", true),
  ]);

  const intakeForm =
    intakeForms?.find((form) => form.slug === INTAKE_SLUG) ?? intakeForms?.[0] ?? null;
  const treatmentConsent = consentForms?.find((form) => form.slug === "treatment-consent");
  const accountConsent = consentForms?.find((form) => form.slug === "account-responsibility");

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={routes.admin.patients}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to patients
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-semibold">Add patient</h1>
        <p className="text-sm text-muted-foreground">
          Create a patient record and capture the same informed consent used at signup. If the
          account payer is the patient they get the patient portal; if someone else pays they get
          the family portal.
        </p>
      </div>

      {intakeForm && treatmentConsent && accountConsent ? (
        <PortalFormsClient
          intakeForm={intakeForm}
          treatmentConsent={treatmentConsent}
          accountConsent={accountConsent}
          mode="staff"
          submitAction={createPatientWithStaffConsentAction}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          The informed consent package is not published yet.
        </p>
      )}
    </div>
  );
}
