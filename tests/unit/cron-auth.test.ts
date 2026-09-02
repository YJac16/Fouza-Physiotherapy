import { afterEach, describe, expect, it } from "vitest";

import { authorizeCronRequest } from "@/lib/cron/auth";

describe("authorizeCronRequest", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("allows local dev without CRON_SECRET", () => {
    delete process.env.CRON_SECRET;
    delete process.env.VERCEL_ENV;
    const request = new Request("http://localhost/api/cron/outbox");
    expect(authorizeCronRequest(request)).toBe(true);
  });

  it("rejects production without CRON_SECRET", () => {
    delete process.env.CRON_SECRET;
    process.env.VERCEL_ENV = "production";
    const request = new Request("https://fouzaphysiotherapy.co.za/api/cron/outbox");
    expect(authorizeCronRequest(request)).toBe(false);
  });

  it("requires bearer token when CRON_SECRET is set", () => {
    process.env.CRON_SECRET = "test-secret";
    process.env.VERCEL_ENV = "production";
    const unauthorized = new Request("https://fouzaphysiotherapy.co.za/api/cron/outbox");
    expect(authorizeCronRequest(unauthorized)).toBe(false);

    const authorized = new Request("https://fouzaphysiotherapy.co.za/api/cron/outbox", {
      headers: { Authorization: "Bearer test-secret" },
    });
    expect(authorizeCronRequest(authorized)).toBe(true);
  });
});
