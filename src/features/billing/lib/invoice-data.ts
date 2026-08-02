import { getPracticeSetting } from "@/features/practice/api/settings";
import {
  DEFAULT_BANKING,
  type InvoiceDocumentBanking,
} from "@/features/billing/components/invoice-document";
import { siteConfig } from "@/config/site";
import { requireStaff, requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
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
      "*, patients(id, first_name, last_name, email, postal_address), invoice_line_items(*), payments(*)",
    )
    .eq("id", invoiceId)
    .maybeSingle();

  if (error || !invoice) return { invoice: null, error: error?.message ?? "Not found" };
  return { invoice, error: null };
}

export async function getInvoiceForPatient(invoiceId: string) {
  const profile = await requireUser();
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!patient) return { invoice: null, error: "Patient profile not found" };

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      "*, patients(id, first_name, last_name, email, postal_address), invoice_line_items(*), payments(*)",
    )
    .eq("id", invoiceId)
    .eq("patient_id", patient.id)
    .maybeSingle();

  if (error || !invoice) return { invoice: null, error: error?.message ?? "Not found" };
  return { invoice, error: null };
}
