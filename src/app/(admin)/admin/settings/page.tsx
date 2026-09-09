import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { DEFAULT_BANKING } from "@/features/billing/components/invoice-document";
import { signOutAction } from "@/features/auth";
import { getPracticeSetting } from "@/features/practice/api/settings";
import { PracticeSettingsForm } from "@/features/practice/components/settings-form";
import { listLetterTemplates } from "@/features/clinical-letters/api/letters";
import { LetterTemplateForm } from "@/features/clinical-letters/components/letter-template-form";
import { canAuthorClinicalLetters } from "@/features/clinical-letters/lib/auth";
import { getSessionProfile } from "@/lib/auth/guards";
import type { ClinicalLetterType } from "@/features/clinical-letters/types/letter";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export default async function AdminSettingsPage() {
  const profile = await getSessionProfile();
  const [
    practiceName,
    contactEmail,
    contactPhone,
    bankName,
    accountName,
    accountNumber,
    branchCode,
    accountType,
    proofEmail,
    templatesResult,
  ] = await Promise.all([
    getPracticeSetting("practice_name"),
    getPracticeSetting("contact_email"),
    getPracticeSetting("contact_phone"),
    getPracticeSetting("banking.bank_name"),
    getPracticeSetting("banking.account_name"),
    getPracticeSetting("banking.account_number"),
    getPracticeSetting("banking.branch_code"),
    getPracticeSetting("banking.account_type"),
    getPracticeSetting("banking.proof_email"),
    listLetterTemplates(),
  ]);

  const canAuthor = profile ? canAuthorClinicalLetters(profile.role) : false;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Practice-wide configuration for branding, contact, invoice banking, and letter templates.
        </p>
      </div>

      <PracticeSettingsForm
        defaults={{
          practiceName: asString(practiceName, siteConfig.practiceName),
          contactEmail: asString(contactEmail, siteConfig.email),
          contactPhone: asString(contactPhone, siteConfig.phoneDisplay),
          bankName: asString(bankName, DEFAULT_BANKING.bankName),
          accountName: asString(accountName, DEFAULT_BANKING.accountName),
          accountNumber: asString(accountNumber, DEFAULT_BANKING.accountNumber),
          branchCode: asString(branchCode, DEFAULT_BANKING.branchCode),
          accountType: asString(accountType, DEFAULT_BANKING.accountType),
          proofEmail: asString(proofEmail, DEFAULT_BANKING.proofEmail),
        }}
      />

      {canAuthor ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Letter templates</h2>
            <p className="text-sm text-muted-foreground">
              Default wording for new proof of attendance and referral letters. Each letter can still be
              edited before it is signed.
            </p>
          </div>
          {(templatesResult.data ?? []).map((template) => (
            <LetterTemplateForm
              key={template.letter_type}
              letterType={template.letter_type as ClinicalLetterType}
              defaults={{
                title: template.title,
                body: template.body,
                physiotherapistName: template.physiotherapist_name,
                qualifications: template.qualifications,
                contact: template.contact,
              }}
            />
          ))}
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-h5">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={signOutAction}>
            <Button type="submit" variant="outline">
              <LogOut className="size-4" aria-hidden />
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
