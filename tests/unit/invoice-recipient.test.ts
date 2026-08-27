import { describe, expect, it } from "vitest";

import {
  formatAccountHolderLine,
  greetingFirstName,
  parseDisplayName,
  resolveInvoiceGreetingName,
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

  it("parses title prefixes from full names", () => {
    expect(parseDisplayName("Mr Roshan Jaga")).toEqual({
      title: "Mr",
      firstName: "Roshan",
      lastName: "Jaga",
    });
    expect(parseDisplayName("Mrs Jane Doe")).toEqual({
      title: "Mrs",
      firstName: "Jane",
      lastName: "Doe",
    });
    expect(parseDisplayName("Roshan Jaga")).toEqual({
      title: null,
      firstName: "Roshan",
      lastName: "Jaga",
    });
  });

  it("derives greeting first names from titled names", () => {
    expect(greetingFirstName("Mr Roshan Jaga")).toBe("Roshan");
    expect(greetingFirstName("Roshan Jaga")).toBe("Roshan");
    expect(greetingFirstName("Mrs Jane Doe")).toBe("Jane");
    expect(greetingFirstName("Dr John Smith")).toBe("John");
    expect(greetingFirstName("Prof Jane Smith")).toBe("Jane");
    expect(greetingFirstName(null, "Bhadra")).toBe("Bhadra");
    expect(greetingFirstName(null, null)).toBe("there");
  });

  describe("resolveInvoiceGreetingName (invoice email call-site path)", () => {
    it("greets the account holder for family invoices, not the patient", () => {
      expect(
        resolveInvoiceGreetingName({
          billingFullName: "Mr Roshan Jaga",
          patientFirstName: "Bhadra",
        }),
      ).toBe("Roshan");
    });

    it("greets the self-billed patient when billing name matches", () => {
      expect(
        resolveInvoiceGreetingName({
          billingFullName: "John Smith",
          patientFirstName: "John",
        }),
      ).toBe("John");
    });

    it("falls back to patient first name when there is no separate billing identity", () => {
      expect(
        resolveInvoiceGreetingName({
          billingFullName: null,
          patientFirstName: "John",
        }),
      ).toBe("John");
    });

    it("does not fall back to patient name when billing identity is present but unusable", () => {
      expect(
        resolveInvoiceGreetingName({
          billingFullName: "Mr",
          patientFirstName: "Bhadra",
        }),
      ).toBe("there");
    });
  });
});
