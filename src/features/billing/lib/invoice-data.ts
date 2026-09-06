import { getPracticeSetting } from "@/features/practice/api/settings";
import {
  DEFAULT_BANKING,
  type InvoiceDocumentBanking,
} from "@/features/billing/components/invoice-document";
import { resolveInvoiceRecipientEmail } from "@/features/billing/lib/invoice-recipient";
import { siteConfig } from "@/config/site";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { listAccessiblePatients } from "@/features/patients/api/patients";

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export type InvoicePracticeIdentifiers = {
  practiceNumber: string | null;
  ptNumber: string | null;
  vatNumber: string | null;
};

export async function getInvoicePracticeIdentifiers(): Promise<InvoicePracticeIdentifiers> {
  const [practiceNumberSetting, ptNumberSetting, vatNumberSetting] = await Promise.all([
    getPracticeSetting("practice.number"),
    getPracticeSetting("practice.pt_number"),
    getPracticeSetting("practice.vat_number"),
  ]);

  const practiceNumberFromDb =
    typeof practiceNumberSetting === "string" ? practiceNumberSetting.trim() : null;
  const envPracticeNumber = siteConfig.founder.practiceNumber?.trim() || null;

  return {
    practiceNumber: envPracticeNumber || practiceNumberFromDb,
    ptNumber: typeof ptNumberSetting === "string" ? ptNumberSetting.trim() || null : null,
    vatNumber: typeof vatNumberSetting === "string" ? vatNumberSetting.trim() || null : null,
  };
}

export async function getInvoiceBankingSettings(): Promise<InvoiceDocumentBanking> {
  const [bankName, accountName, accountNumber, branchCode, accountType, proofEmail] =
    await Promise.all([
      getPracticeSetting("banking.bank_name"),
      getPracticeSetting("banking.account_name"),
      getPracticeSetting("banking.account_number"),
      getPracticeSetting("banking.branch_code"),
      getPracticeSetting("banking.account_type"),
      getPracticeSetting("banking.proof_email"),
    ]);

  return {
    bankName: asString(bankName, DEFAULT_BANKING.bankName),
    accountName: asString(accountName, DEFAULT_BANKING.accountName),
    accountNumber: asString(accountNumber, DEFAULT_BANKING.accountNumber),
    branchCode: asString(branchCode, DEFAULT_BANKING.branchCode),
    accountType: asString(accountType, DEFAULT_BANKING.accountType),
    proofEmail: asString(proofEmail, DEFAULT_BANKING.proofEmail || siteConfig.email),
  };
}

export async function getInvoiceForStaff(invoiceId: string) {
  await requireStaff();
  const supabase = await createClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      "*, patients(id, first_name, last_name, email, postal_address, billing_name, billing_email, billing_address), invoice_line_items(*), payments(*)",
    )
    .eq("id", invoiceId)
    .maybeSingle();

  if (error || !invoice) return { invoice: null, error: error?.message ?? "Not found" };
  return { invoice, error: null };
}

export async function getInvoiceForPatient(invoiceId: string) {
  const { data: accessible } = await listAccessiblePatients();
  const ids = accessible.map((patient) => patient.id);
  if (!ids.length) return { invoice: null, error: "Patient profile not found" };

  const supabase = await createClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      "*, patients(id, first_name, last_name, email, postal_address, billing_name, billing_email, billing_address), invoice_line_items(*), payments(*)",
    )
    .eq("id", invoiceId)
    .in("patient_id", ids)
    .maybeSingle();

  if (error || !invoice) return { invoice: null, error: error?.message ?? "Not found" };
  return { invoice, error: null };
}

export async function resolvePatientInvoiceRecipient(patientId: string) {
  const admin = createServiceClient();
  const [{ data: patient }, { data: holder }] = await Promise.all([
    admin
      .from("patients")
      .select("email, billing_email, billing_name, first_name")
      .eq("id", patientId)
      .maybeSingle(),
    admin
      .from("patient_contacts")
      .select("email, full_name")
      .eq("patient_id", patientId)
      .eq("is_account_holder", true)
      .maybeSingle(),
  ]);

  return {
    email: resolveInvoiceRecipientEmail({
      billingEmail: patient?.billing_email,
      accountHolderEmail: holder?.email,
      patientEmail: patient?.email,
    }),
    firstName: holder?.full_name?.split(" ")[0] || patient?.first_name || "there",
    accountHolderName: patient?.billing_name || holder?.full_name || null,
    accountHolderEmail: holder?.email || patient?.billing_email || null,
  };
}
