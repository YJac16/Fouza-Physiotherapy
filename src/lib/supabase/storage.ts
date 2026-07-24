import { createServiceClient } from "@/lib/supabase/admin";

export type StorageBucket =
  | "avatars"
  | "exercise-media"
  | "consent-signatures"
  | "blog-media"
  | "patient-documents"
  | "invoices";

export async function createSignedUploadUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn = 60,
) {
  const supabase = createServiceClient();
  return supabase.storage.from(bucket).createSignedUploadUrl(path, {
    upsert: true,
  });
}

export async function createSignedDownloadUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn = 60 * 10,
) {
  const supabase = createServiceClient();
  return supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
}

export function patientDocPath(patientId: string, filename: string) {
  return `${patientId}/${Date.now()}-${filename}`;
}
