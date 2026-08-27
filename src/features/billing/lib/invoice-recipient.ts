export type InvoiceRecipientSource = {
  billingEmail?: string | null;
  accountHolderEmail?: string | null;
  patientEmail?: string | null;
};

export type InvoiceAccountHolder = {
  name?: string | null;
  email?: string | null;
};

const NAME_TITLES = new Set(["mr", "mrs", "ms", "miss", "dr", "prof"]);

export function normalizeEmail(value?: string | null) {
  const trimmed = value?.trim().toLowerCase() ?? "";
  return trimmed || null;
}

function stripTitleToken(token: string): boolean {
  const normalized = token.toLowerCase().replace(/\.$/, "");
  return NAME_TITLES.has(normalized);
}

export function parseDisplayName(fullName?: string | null): {
  title: string | null;
  firstName: string | null;
  lastName: string | null;
} {
  const trimmed = fullName?.trim() ?? "";
  if (!trimmed) return { title: null, firstName: null, lastName: null };

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (!parts.length) return { title: null, firstName: null, lastName: null };

  let start = 0;
  let title: string | null = null;
  if (stripTitleToken(parts[0] ?? "")) {
    title = parts[0] ?? null;
    start = 1;
  }

  const remaining = parts.slice(start);
  if (!remaining.length) {
    return { title, firstName: null, lastName: null };
  }

  if (remaining.length === 1) {
    return { title, firstName: remaining[0] ?? null, lastName: null };
  }

  return {
    title,
    firstName: remaining[0] ?? null,
    lastName: remaining.slice(1).join(" ") || null,
  };
}

/** First name for email greetings — handles title prefixes like Mr/Mrs/Dr. */
export function greetingFirstName(
  fullName?: string | null,
  fallbackFirstName?: string | null,
): string {
  const parsed = parseDisplayName(fullName);
  if (parsed.firstName) return parsed.firstName;

  const fromFallback = fallbackFirstName?.trim();
  if (fromFallback) return fromFallback;

  return "there";
}

export type InvoiceGreetingSource = {
  billingFullName?: string | null;
  patientFirstName?: string | null;
};

/** Greeting name for invoice emails — billing/account-holder identity takes precedence. */
export function resolveInvoiceGreetingName(source: InvoiceGreetingSource): string {
  const billingFullName = source.billingFullName?.trim() || null;
  return greetingFirstName(
    billingFullName,
    billingFullName ? null : source.patientFirstName,
  );
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
