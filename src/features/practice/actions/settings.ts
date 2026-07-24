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

  const results = await Promise.all([
    setPracticeSetting("practice_name", practiceName),
    setPracticeSetting("contact_email", contactEmail),
    setPracticeSetting("contact_phone", contactPhone),
  ]);

  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: "Settings saved" };
}
