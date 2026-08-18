import {
  addSastDays,
  endOfSastDayExclusive,
  startOfSastDay,
  toDateKey,
} from "@/features/booking/lib/timezone";

export type InvoiceStoredStatus = "draft" | "sent" | "paid" | "void" | "overdue";

export type InvoiceDisplayStatus = InvoiceStoredStatus | "partially_paid";

export type InvoiceCardStatus = "paid" | "pending" | "overdue" | "partially_paid" | "void";

export function invoicePaidCents(payments: Array<{ amount_cents: number }>) {
  return payments.reduce((sum, payment) => sum + payment.amount_cents, 0);
}

export function invoiceOutstandingCents(totalCents: number, paidCents: number) {
  return Math.max(totalCents - paidCents, 0);
}

export function invoiceDisplayStatus(input: {
  status: InvoiceStoredStatus | string;
  totalCents: number;
  paidCents: number;
}): InvoiceDisplayStatus {
  const status = input.status as InvoiceStoredStatus;
  if (status === "void") return "void";
  if (status === "draft") {
    if (input.paidCents <= 0) return "draft";
    if (input.totalCents >= 0 && input.paidCents >= input.totalCents) return "paid";
    return "partially_paid";
  }
  if (status === "paid" || (input.totalCents >= 0 && input.paidCents >= input.totalCents)) {
    return "paid";
  }
  if (status === "overdue") return "overdue";
  if (input.paidCents > 0) return "partially_paid";
  return "sent";
}

export function invoiceCardStatus(display: InvoiceDisplayStatus): InvoiceCardStatus {
  if (display === "paid") return "paid";
  if (display === "overdue") return "overdue";
  if (display === "partially_paid") return "partially_paid";
  if (display === "void") return "void";
  return "pending";
}

export function invoiceDisplayLabel(display: InvoiceDisplayStatus) {
  switch (display) {
    case "partially_paid":
      return "Partially paid";
    case "sent":
      return "Sent";
    case "draft":
      return "Draft";
    case "paid":
      return "Paid";
    case "void":
      return "Void";
    case "overdue":
      return "Overdue";
    default:
      return display;
  }
}

/** Mirrors refresh_invoice_payment_status — stored enum never uses partially_paid. */
export function storedInvoiceStatusAfterPayments(input: {
  status: InvoiceStoredStatus;
  totalCents: number;
  paidCents: number;
}): InvoiceStoredStatus {
  if (input.status === "void") return "void";
  if (input.totalCents >= 0 && input.paidCents >= input.totalCents) return "paid";
  if (input.status === "draft" && input.paidCents === 0) return "draft";
  if (input.status === "paid") return "sent";
  return input.status;
}

export function countsAsTodayAppointment(status: string) {
  return status !== "cancelled";
}

export function isWithinSastDay(startsAtIso: string, dateKey: string) {
  const start = startOfSastDay(dateKey).toISOString();
  const endExclusive = endOfSastDayExclusive(dateKey).toISOString();
  return startsAtIso >= start && startsAtIso < endExclusive;
}

export function sastDateRangeIso(fromDate: string, toDateInclusive: string) {
  return {
    fromIso: startOfSastDay(fromDate).toISOString(),
    toExclusiveIso: endOfSastDayExclusive(toDateInclusive).toISOString(),
  };
}

export function statementPeriodBounds(fromDate: string, toDateInclusive: string) {
  return {
    issueFrom: fromDate,
    issueTo: toDateInclusive,
    paidFromIso: startOfSastDay(fromDate).toISOString(),
    paidToExclusiveIso: endOfSastDayExclusive(toDateInclusive).toISOString(),
  };
}

export function lastNSastDaysRange(days: number, now = new Date()) {
  const toKey = toDateKey(now);
  const fromKey = addSastDays(toKey, -(days - 1));
  return {
    fromDate: fromKey,
    toDate: toKey,
    ...sastDateRangeIso(fromKey, toKey),
  };
}

export function currentSastMonthRange(now = new Date()) {
  const today = toDateKey(now);
  const [year, month] = today.split("-");
  const fromDate = `${year}-${month}-01`;
  return {
    fromDate,
    toDate: today,
    ...sastDateRangeIso(fromDate, today),
  };
}

export function invoicedCents(invoices: Array<{ status: string; total_cents: number }>) {
  return invoices
    .filter((invoice) => invoice.status !== "void")
    .reduce((sum, invoice) => sum + invoice.total_cents, 0);
}
