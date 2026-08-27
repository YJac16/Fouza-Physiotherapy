import { headers } from "next/headers";

/** Best-effort User-Agent from request headers. */
export async function getRequestUserAgent(): Promise<string | null> {
  const h = await headers();
  return h.get("user-agent")?.trim() || null;
}
