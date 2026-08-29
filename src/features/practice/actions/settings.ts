"use server";

import { revalidatePath } from "next/cache";

import { setPracticeSetting } from "@/features/practice/api/settings";
import { requireAdmin } from "@/lib/auth/guards";

export type SettingsActionState = { error?: string; success?: string };

async function saveKeys(entries: Array<[string, string]>) {
  const results = await Promise.all(entries.map(([key, value]) => setPracticeSetting(key, value)));
  const failed = results.find((r) => r.error);
  return failed?.error?.message ?? null;
}

export async function savePracticeSettingsAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await requireAdmin();
  const section = formData.get("section")?.toString() || "all";

  if (section === "banking") {
    if (formData.get("confirmBanking") !== "true") {
      return { error: "Tick the confirmation box before saving banking details." };
    }
    const error = await saveKeys([
      ["banking.bank_name", formData.get("bankName")?.toString() ?? ""],
      ["banking.account_name", formData.get("accountName")?.toString() ?? ""],
      ["banking.account_number", formData.get("accountNumber")?.toString() ?? ""],
      ["banking.branch_code", formData.get("branchCode")?.toString() ?? ""],
      ["banking.account_type", formData.get("accountType")?.toString() ?? ""],
      ["banking.proof_email", formData.get("proofEmail")?.toString() ?? ""],
    ]);
    if (error) return { error };
    revalidatePath("/admin/settings");
    revalidatePath("/admin/billing");
    return { success: "Banking details saved" };
  }

  const error = await saveKeys([
    ["practice_name", formData.get("practiceName")?.toString() ?? ""],
    ["contact_email", formData.get("contactEmail")?.toString() ?? ""],
    ["contact_phone", formData.get("contactPhone")?.toString() ?? ""],
  ]);
  if (error) return { error };

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: "Practice details saved" };
}
