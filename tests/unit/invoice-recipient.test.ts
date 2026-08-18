import { describe, expect, it } from "vitest";

import {
  formatAccountHolderLine,
  resolveInvoiceRecipientEmail,
} from "@/features/billing/lib/invoice-recipient";

describe("invoice recipient", () => {
  it("prefers billing_email over account holder and patient email", () => {
    expect(
      resolveInvoiceRecipientEmail({
        billingEmail: "son@example.com",
        accountHolderEmail: "holder@example.com",
        patientEmail: "parent@example.com",
      }),
    ).toBe("son@example.com");
  });

  it("falls back to the account-holder contact email", () => {
    expect(
      resolveInvoiceRecipientEmail({
        billingEmail: " ",
        accountHolderEmail: "Holder@example.com",
        patientEmail: "parent@example.com",
      }),
    ).toBe("holder@example.com");
  });

  it("uses the patient email last", () => {
    expect(
      resolveInvoiceRecipientEmail({
        billingEmail: null,
        accountHolderEmail: null,
        patientEmail: "parent@example.com",
      }),
    ).toBe("parent@example.com");
  });

  it("returns null when no email exists", () => {
    expect(resolveInvoiceRecipientEmail({})).toBeNull();
  });

  it("formats the account holder line for the invoice", () => {
    expect(formatAccountHolderLine({ name: "Yusuf Khan", email: "son@example.com" })).toBe(
      "Yusuf Khan · son@example.com",
    );
  });
});
