import { describe, expect, it } from "vitest";

import {
  INVOICE_DEFAULT_DUE_DAYS,
  effectiveInvoiceDueDate,
  invoicePatientSlug,
  invoicePrintBasename,
  invoicePrintDocumentTitle,
  invoicePaymentReference,
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

describe("invoicePatientSlug", () => {
  it("builds an ASCII hyphenated slug", () => {
    expect(invoicePatientSlug("Elyaaz Jacobs")).toBe("Elyaaz-Jacobs");
  });

  it("returns null for empty names", () => {
    expect(invoicePatientSlug("   ")).toBeNull();
  });
});

describe("invoicePrintBasename", () => {
  it("uses invoice number only when patient name is missing", () => {
    expect(invoicePrintBasename("INV-2026-00007")).toBe("INV-2026-00007");
    expect(invoicePrintBasename("INV-2026-00007", "   ")).toBe("INV-2026-00007");
  });

  it("appends patient slug when present", () => {
    expect(invoicePrintBasename("INV-2026-00007", "Elyaaz Jacobs")).toBe(
      "INV-2026-00007_Elyaaz-Jacobs",
    );
  });
});

describe("invoicePrintFilename", () => {
  it("uses invoice number for the primary filename", () => {
    expect(invoicePrintFilename("INV-2026-00007")).toBe("INV-2026-00007.pdf");
  });

  it("includes patient slug when available", () => {
    expect(invoicePrintFilename("INV-2026-00007", "Elyaaz Jacobs")).toBe(
      "INV-2026-00007_Elyaaz-Jacobs.pdf",
    );
  });
});

describe("invoicePrintDocumentTitle", () => {
  it("matches basename for browser print save-as", () => {
    expect(invoicePrintDocumentTitle("INV-2026-00007", "Elyaaz Jacobs")).toBe(
      "INV-2026-00007_Elyaaz-Jacobs",
    );
  });
});

describe("invoicePaymentReference", () => {
  it("uses the invoice number", () => {
    expect(invoicePaymentReference("INV-2026-00007")).toBe("INV-2026-00007");
  });
});
