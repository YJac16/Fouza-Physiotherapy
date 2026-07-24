import { describe, expect, it } from "vitest";

import { isAllowedUploadMime, isHoneypotFilled, rateLimit } from "@/lib/security";

describe("security helpers", () => {
  it("detects honeypot fills", () => {
    expect(isHoneypotFilled("")).toBe(false);
    expect(isHoneypotFilled("bot")).toBe(true);
  });

  it("rate limits a key", () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(false);
  });

  it("allows safe upload mime types", () => {
    expect(isAllowedUploadMime("application/pdf")).toBe(true);
    expect(isAllowedUploadMime("application/x-msdownload")).toBe(false);
  });
});
