import { headers } from "next/headers";

/** Best-effort client IP from proxy headers (Vercel / common reverse proxies). */
export async function getRequestIpAddress(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return h.get("x-real-ip")?.trim() || h.get("cf-connecting-ip")?.trim() || null;
}
