/** Default payment terms when no due date is stored on the invoice. */
export const INVOICE_DEFAULT_DUE_DAYS = 7;

export function effectiveInvoiceDueDate(
  issueDate: string,
  dueDate?: string | null,
): string {
  if (dueDate) return dueDate;
  const d = new Date(issueDate.includes("T") ? issueDate : `${issueDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return issueDate;
  d.setDate(d.getDate() + INVOICE_DEFAULT_DUE_DAYS);
  return d.toISOString().slice(0, 10);
}

/** Human-readable default filename for Print → Save as PDF. */
export function invoicePrintFilename(invoiceNumber: string, patientName: string): string {
  const slug = patientName
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("-");

  return slug ? `${invoiceNumber}-${slug}` : `Fouza-${invoiceNumber}`;
}
