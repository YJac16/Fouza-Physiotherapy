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

/** ASCII patient slug for filenames: hyphens, no spaces. */
export function invoicePatientSlug(patientName?: string | null): string | null {
  const slug = (patientName ?? "")
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .join("-");

  return slug || null;
}

/**
 * Base name for invoice print/download (no extension).
 * Primary: INV-2026-00007
 * With patient: INV-2026-00007_Elyaaz-Jacobs
 */
export function invoicePrintBasename(
  invoiceNumber: string,
  patientName?: string | null,
): string {
  const slug = invoicePatientSlug(patientName);
  return slug ? `${invoiceNumber}_${slug}` : invoiceNumber;
}

/** Full filename for Save as PDF / Content-Disposition. */
export function invoicePrintFilename(
  invoiceNumber: string,
  patientName?: string | null,
): string {
  return `${invoicePrintBasename(invoiceNumber, patientName)}.pdf`;
}

/** document.title for Print → Save as PDF (browsers append .pdf when saving). */
export function invoicePrintDocumentTitle(
  invoiceNumber: string,
  patientName?: string | null,
): string {
  return invoicePrintBasename(invoiceNumber, patientName);
}
