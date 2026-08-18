import { describe, expect, it } from "vitest";

import {
  countsAsTodayAppointment,
  invoiceCardStatus,
  invoiceDisplayStatus,
  invoiceOutstandingCents,
  invoicePaidCents,
  invoicedCents,
  lastNSastDaysRange,
  statementPeriodBounds,
  storedInvoiceStatusAfterPayments,
} from "@/features/analytics/lib/finance";

describe("invoice payment completeness", () => {
  it("does not treat a partial payment as paid", () => {
    expect(
      storedInvoiceStatusAfterPayments({
        status: "sent",
        totalCents: 70000,
        paidCents: 100,
      }),
    ).toBe("sent");
    expect(
      invoiceDisplayStatus({
        status: "sent",
        totalCents: 70000,
        paidCents: 100,
      }),
    ).toBe("partially_paid");
    expect(invoiceCardStatus("partially_paid")).toBe("partially_paid");
  });

  it("marks paid only when payments cover the total", () => {
    expect(
      storedInvoiceStatusAfterPayments({
        status: "sent",
        totalCents: 70000,
        paidCents: 70000,
      }),
    ).toBe("paid");
    expect(
      invoiceDisplayStatus({
        status: "sent",
        totalCents: 70000,
        paidCents: 70000,
      }),
    ).toBe("paid");
  });

  it("reopens a stored paid invoice after an underpayment", () => {
    expect(
      storedInvoiceStatusAfterPayments({
        status: "paid",
        totalCents: 70000,
        paidCents: 100,
      }),
    ).toBe("sent");
  });

  it("leaves void invoices unchanged", () => {
    expect(
      storedInvoiceStatusAfterPayments({
        status: "void",
        totalCents: 70000,
        paidCents: 70000,
      }),
    ).toBe("void");
    expect(
      invoiceDisplayStatus({
        status: "void",
        totalCents: 70000,
        paidCents: 0,
      }),
    ).toBe("void");
  });

  it("computes outstanding and paid totals", () => {
    expect(invoicePaidCents([{ amount_cents: 20000 }, { amount_cents: 15000 }])).toBe(35000);
    expect(invoiceOutstandingCents(70000, 35000)).toBe(35000);
    expect(invoiceOutstandingCents(70000, 80000)).toBe(0);
  });

  it("excludes void invoices from invoiced totals", () => {
    expect(
      invoicedCents([
        { status: "sent", total_cents: 70000 },
        { status: "void", total_cents: 90000 },
        { status: "paid", total_cents: 10000 },
      ]),
    ).toBe(80000);
  });
});

describe("practice date bounds", () => {
  it("includes the last SAST day of a statement period", () => {
    const bounds = statementPeriodBounds("2026-08-01", "2026-08-14");
    expect(bounds.paidFromIso).toBe("2026-07-31T22:00:00.000Z");
    expect(bounds.paidToExclusiveIso).toBe("2026-08-14T22:00:00.000Z");
  });

  it("counts today's appointments except cancelled", () => {
    expect(countsAsTodayAppointment("confirmed")).toBe(true);
    expect(countsAsTodayAppointment("completed")).toBe(true);
    expect(countsAsTodayAppointment("no_show")).toBe(true);
    expect(countsAsTodayAppointment("cancelled")).toBe(false);
  });

  it("builds an inclusive last-N-days SAST range", () => {
    const range = lastNSastDaysRange(30, new Date("2026-08-14T12:00:00+02:00"));
    expect(range.fromDate).toBe("2026-07-16");
    expect(range.toDate).toBe("2026-08-14");
    expect(range.toExclusiveIso).toBe("2026-08-14T22:00:00.000Z");
  });
});
