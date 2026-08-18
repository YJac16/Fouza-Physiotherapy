export type InvoiceRecipientSource = {
  billingEmail?: string | null;
  accountHolderEmail?: string | null;
  patientEmail?: string | null;
};

export type InvoiceAccountHolder = {
  name?: string | null;
  email?: string | null;
};

export function normalizeEmail(value?: string | null) {
  const trimmed = value?.trim().toLowerCase() ?? "";
  return trimmed || null;
}

/** Prefer billing_email, then the account-holder contact, then the patient email. */
export function resolveInvoiceRecipientEmail(source: InvoiceRecipientSource): string | null {
  return (
    normalizeEmail(source.billingEmail) ??
    normalizeEmail(source.accountHolderEmail) ??
    normalizeEmail(source.patientEmail)
  );
}

export function formatAccountHolderLine(holder: InvoiceAccountHolder): string | null {
  const name = holder.name?.trim() || "";
  const email = normalizeEmail(holder.email);
  if (!name && !email) return null;
  if (name && email) return `${name} · ${email}`;
  return name || email;
}
