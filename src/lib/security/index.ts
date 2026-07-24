/**
 * Security helpers — rate limiting (in-memory), honeypot, audit helpers.
 * For production multi-instance deploys, replace the Map with Redis/Upstash.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    return { ok: false, remaining: 0 };
  }
  current.count += 1;
  return { ok: true, remaining: limit - current.count };
}

export function isHoneypotFilled(value: FormDataEntryValue | null | undefined) {
  return Boolean(value && String(value).trim().length > 0);
}

export function assertServerSecret(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required secret: ${name}`);
  }
  return value;
}

export const ALLOWED_UPLOAD_MIME = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export function isAllowedUploadMime(mime: string) {
  return (ALLOWED_UPLOAD_MIME as readonly string[]).includes(mime);
}
