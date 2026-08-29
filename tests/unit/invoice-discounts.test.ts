import { describe, expect, it } from "vitest";

import { invoiceTotalsFromLines, lineTotals } from "@/features/billing/lib/discounts";

describe("invoice discounts", () => {
  it("applies a line percent discount", () => {
    const line = lineTotals({
      quantity: 1,
      unitPriceCents: 100000,
      discount: { mode: "percent", percent: 10 },
    });
    expect(line.grossCents).toBe(100000);
    expect(line.discountCents).toBe(10000);
    expect(line.discountPercent).toBe(10);
    expect(line.amountCents).toBe(90000);
  });

  it("applies a line rand discount", () => {
    const line = lineTotals({
      quantity: 1,
      unitPriceCents: 100000,
      discount: { mode: "amount", amountCents: 20000 },
    });
    expect(line.discountCents).toBe(20000);
    expect(line.discountPercent).toBeNull();
    expect(line.amountCents).toBe(80000);
  });

  it("applies an invoice percent discount to the line subtotal", () => {
    const totals = invoiceTotalsFromLines({
      lines: [
        { quantity: 1, unitPriceCents: 70000 },
        { quantity: 1, unitPriceCents: 30000 },
      ],
      invoiceDiscount: { mode: "percent", percent: 10 },
    });
    expect(totals.subtotalCents).toBe(100000);
    expect(totals.invoiceDiscountCents).toBe(10000);
    expect(totals.invoiceDiscountPercent).toBe(10);
    expect(totals.totalDiscountCents).toBe(10000);
    expect(totals.totalCents).toBe(90000);
  });

  it("applies an invoice rand discount", () => {
    const totals = invoiceTotalsFromLines({
      lines: [{ quantity: 1, unitPriceCents: 90000 }],
      invoiceDiscount: { mode: "amount", amountCents: 15000 },
    });
    expect(totals.subtotalCents).toBe(90000);
    expect(totals.invoiceDiscountCents).toBe(15000);
    expect(totals.totalCents).toBe(75000);
  });

  it("combines line and invoice discounts", () => {
    const totals = invoiceTotalsFromLines({
      lines: [
        {
          quantity: 1,
          unitPriceCents: 100000,
          discount: { mode: "percent", percent: 10 },
        },
      ],
      invoiceDiscount: { mode: "amount", amountCents: 10000 },
    });
    expect(totals.subtotalCents).toBe(90000);
    expect(totals.lineDiscountCents).toBe(10000);
    expect(totals.invoiceDiscountCents).toBe(10000);
    expect(totals.totalDiscountCents).toBe(20000);
    expect(totals.grossCents).toBe(100000);
    expect(totals.totalCents).toBe(80000);
  });

  it("caps discounts so the total never goes negative", () => {
    const totals = invoiceTotalsFromLines({
      lines: [
        {
          quantity: 1,
          unitPriceCents: 100000,
          discount: { mode: "amount", amountCents: 200000 },
        },
      ],
      invoiceDiscount: { mode: "amount", amountCents: 50000 },
      taxCents: 0,
    });
    expect(totals.lines[0]?.amountCents).toBe(0);
    expect(totals.subtotalCents).toBe(0);
    expect(totals.invoiceDiscountCents).toBe(0);
    expect(totals.totalCents).toBe(0);
  });

  it("keeps tax after discounts", () => {
    const totals = invoiceTotalsFromLines({
      lines: [{ quantity: 1, unitPriceCents: 100000 }],
      invoiceDiscount: { mode: "percent", percent: 10 },
      taxCents: 1500,
    });
    expect(totals.totalCents).toBe(91500);
  });

  it("shows gross as the display subtotal so line discounts actually reduce TOTAL", () => {
    const totals = invoiceTotalsFromLines({
      lines: [
        {
          quantity: 1,
          unitPriceCents: 205000,
          discount: { mode: "amount", amountCents: 30000 },
        },
      ],
      taxCents: 0,
    });
    expect(totals.grossCents).toBe(205000);
    expect(totals.lineDiscountCents).toBe(30000);
    expect(totals.subtotalCents).toBe(175000);
    expect(totals.totalCents).toBe(175000);
  });
});
