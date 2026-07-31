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
  _expiresIn = 60,
) {
  const supabase = createServiceClient();
  return supabase.storage.from(bucket).createSignedUploadUrl(path, {
    upsert: true,
  });
}

export async function createSignedDownloadUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn = 60 * 60,
) {
  const supabase = createServiceClient();
  return supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
}

/** Full https URLs pass through; storage paths become signed download URLs. */
export async function resolveExerciseMediaUrl(mediaUrl: string | null | undefined) {
  if (!mediaUrl) return null;
  if (/^https?:\/\//i.test(mediaUrl)) return mediaUrl;
  const path = mediaUrl.replace(/^exercise-media\//, "");
  const { data, error } = await createSignedDownloadUrl("exercise-media", path, 60 * 60);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export function patientDocPath(patientId: string, filename: string) {
  return `${patientId}/${Date.now()}-${filename}`;
}
