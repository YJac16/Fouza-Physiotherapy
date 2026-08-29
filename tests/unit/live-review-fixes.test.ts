import { describe, expect, it } from "vitest";

import { randsToCents } from "@/features/billing/lib/money";
import { totalsFromStoredInvoice } from "@/features/billing/lib/discounts";
import {
  formatClockTime,
  practitionerDisplayName,
} from "@/features/booking/lib/practitioner-label";

describe("randsToCents", () => {
  it("treats 2050 as R2050, not cents", () => {
    expect(randsToCents("2050")).toBe(205000);
    expect(randsToCents("2050.00")).toBe(205000);
    expect(randsToCents("2050,00")).toBe(205000);
    expect(randsToCents("2 050,00")).toBe(205000);
  });

  it("rejects empty input", () => {
    expect(randsToCents("")).toBe(0);
    expect(randsToCents("abc")).toBe(0);
  });
});

describe("invoice document totals from stored lines", () => {
  it("subtracts line discounts from the payable total", () => {
    const totals = totalsFromStoredInvoice({
      lines: [
        {
          quantity: 1,
          unit_price_cents: 205000,
          discount_cents: 30000,
        },
      ],
      taxCents: 0,
    });
    expect(totals.displaySubtotalCents).toBe(205000);
    expect(totals.displayDiscountCents).toBe(30000);
    expect(totals.displayTotalCents).toBe(175000);
  });
});

describe("availability display helpers", () => {
  it("reads nested or array profile names", () => {
    expect(
      practitionerDisplayName({ title: "PT", profiles: { full_name: "Fouza Abrahams" } }),
    ).toBe("Fouza Abrahams · PT");
    expect(
      practitionerDisplayName({
        title: null,
        profiles: [{ full_name: "Fouza Abrahams" }],
      }),
    ).toBe("Fouza Abrahams");
  });

  it("formats postgres time values", () => {
    expect(formatClockTime("09:00:00")).toBe("09:00");
    expect(formatClockTime(null)).toBe("—");
  });
});
