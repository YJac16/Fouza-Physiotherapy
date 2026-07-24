"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireStaff, requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { patientDocPath } from "@/lib/supabase/storage";

const docSchema = z.object({
  patientId: z.string().uuid(),
  title: z.string().min(2),
  docType: z.string().default("general"),
  storagePath: z.string().min(3),
  mimeType: z.string().optional(),
  isPatientVisible: z.coerce.boolean().default(false),
});

export type DocumentActionState = { error?: string; success?: string; path?: string };

export async function registerDocumentAction(
  _prev: DocumentActionState,
  formData: FormData,
): Promise<DocumentActionState> {
  const profile = await requireStaff();
  const patientId = formData.get("patientId")?.toString() ?? "";
  const filename = formData.get("filename")?.toString() ?? "document.pdf";
  const path = patientDocPath(patientId, filename);

  const parsed = docSchema.safeParse({
    patientId,
    title: formData.get("title"),
    docType: formData.get("docType") || "general",
    storagePath: path,
    mimeType: formData.get("mimeType") || undefined,
    isPatientVisible: formData.get("isPatientVisible") === "true",
  });
  if (!parsed.success) return { error: "Invalid document metadata" };

  const supabase = await createClient();
  const { error } = await supabase.from("documents").insert({
    patient_id: parsed.data.patientId,
    uploaded_by: profile.id,
    title: parsed.data.title,
    doc_type: parsed.data.docType,
    storage_path: parsed.data.storagePath,
    mime_type: parsed.data.mimeType,
    is_patient_visible: parsed.data.isPatientVisible,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/patients");
  return { success: "Document registered", path };
}

export async function listPatientDocuments() {
  const profile = await requireUser();
  const supabase = await createClient();
  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("profile_id", profile.id)
    .maybeSingle();
  if (!patient) return { data: [], error: null };
  return supabase
    .from("documents")
    .select("*")
    .eq("patient_id", patient.id)
    .eq("is_patient_visible", true)
    .order("created_at", { ascending: false });
}

export async function listStaffDocuments(patientId: string) {
  await requireStaff();
  const supabase = await createClient();
  return supabase
    .from("documents")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
}
