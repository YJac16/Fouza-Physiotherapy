import { PracticeSettingsForm } from "@/features/practice/components/settings-form";
import { getPracticeSetting } from "@/features/practice/api/settings";
import { DEFAULT_BANKING } from "@/features/billing/components/invoice-document";
import { siteConfig } from "@/config/site";

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export default async function AdminSettingsPage() {
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
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Practice-wide configuration for branding, contact, and invoice banking details.
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
    </div>
  );
}
