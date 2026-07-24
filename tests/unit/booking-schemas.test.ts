import { describe, expect, it } from "vitest";

import {
  confirmBookingSchema,
  holdSchema,
  slotQuerySchema,
} from "@/features/booking/schemas/booking";

describe("booking schemas", () => {
  it("accepts valid slot query", () => {
    const parsed = slotQuerySchema.safeParse({
      practitionerId: "11111111-1111-4111-8111-111111111111",
      serviceId: "22222222-2222-4222-8222-222222222222",
      date: "2026-07-20",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects bad hold", () => {
    const parsed = holdSchema.safeParse({
      practitionerId: "bad",
      serviceId: "22222222-2222-4222-8222-222222222222",
      startsAt: "not-a-date",
      endsAt: "2026-07-20T10:00:00.000Z",
    });
    expect(parsed.success).toBe(false);
  });

  it("requires confirm fields", () => {
    const parsed = confirmBookingSchema.safeParse({
      holdToken: "token-token",
      firstName: "A",
      lastName: "B",
      email: "a@b.com",
      phone: "0645136210",
    });
    expect(parsed.success).toBe(true);
  });
});
