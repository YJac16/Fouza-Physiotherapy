"use server";

import { revalidatePath } from "next/cache";

import { setPracticeSetting } from "@/features/practice/api/settings";
import { requireAdmin } from "@/lib/auth/guards";

export type SettingsActionState = { error?: string; success?: string };

export async function savePracticeSettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireAdmin();

  const practiceName = formData.get("practiceName")?.toString() ?? "";
  const contactEmail = formData.get("contactEmail")?.toString() ?? "";
  const contactPhone = formData.get("contactPhone")?.toString() ?? "";
  const bankName = formData.get("bankName")?.toString() ?? "";
  const accountName = formData.get("accountName")?.toString() ?? "";
  const accountNumber = formData.get("accountNumber")?.toString() ?? "";
  const branchCode = formData.get("branchCode")?.toString() ?? "";
  const accountType = formData.get("accountType")?.toString() ?? "";
  const proofEmail = formData.get("proofEmail")?.toString() ?? "";

  const results = await Promise.all([
    setPracticeSetting("practice_name", practiceName),
    setPracticeSetting("contact_email", contactEmail),
    setPracticeSetting("contact_phone", contactPhone),
    setPracticeSetting("banking.bank_name", bankName),
    setPracticeSetting("banking.account_name", accountName),
    setPracticeSetting("banking.account_number", accountNumber),
    setPracticeSetting("banking.branch_code", branchCode),
    setPracticeSetting("banking.account_type", accountType),
    setPracticeSetting("banking.proof_email", proofEmail),
  ]);

  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/billing");
  return { success: "Settings saved" };
}
