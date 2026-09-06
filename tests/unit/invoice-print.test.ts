import { describe, expect, it } from "vitest";

import {
  INVOICE_DEFAULT_DUE_DAYS,
  effectiveInvoiceDueDate,
  invoicePrintFilename,
} from "@/features/billing/lib/invoice-print";

describe("effectiveInvoiceDueDate", () => {
  it("returns stored due date when present", () => {
    expect(effectiveInvoiceDueDate("2026-03-01", "2026-03-15")).toBe("2026-03-15");
  });

  it(`defaults to issue date + ${INVOICE_DEFAULT_DUE_DAYS} days`, () => {
    expect(effectiveInvoiceDueDate("2026-03-01", null)).toBe("2026-03-08");
  });
});

describe("invoicePrintFilename", () => {
  it("builds a human-readable save-as name", () => {
    expect(invoicePrintFilename("INV-2026-00007", "Elyaaz Jacobs")).toBe(
      "INV-2026-00007-Elyaaz-Jacobs",
    );
  });

  it("falls back when patient name is empty", () => {
    expect(invoicePrintFilename("INV-2026-00007", "   ")).toBe("Fouza-INV-2026-00007");
  });
});
