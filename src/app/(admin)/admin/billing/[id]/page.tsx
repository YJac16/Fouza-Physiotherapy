import Link from "next/link";
import { notFound } from "next/navigation";

import {
  InvoiceReceiptDocument,
  type InvoiceDocumentLine,
} from "@/features/billing/components/invoice-document";
import { InvoiceDocumentToolbar } from "@/features/billing/components/invoice-toolbar";
import { InvoiceLineEditor } from "@/features/billing/components/invoice-line-editor";
import { EDITABLE_INVOICE_STATUSES } from "@/features/billing/lib/addons";
import {
  getInvoiceBankingSettings,
  getInvoiceForStaff,
} from "@/features/billing/lib/invoice-data";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminInvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [{ invoice, error }, banking] = await Promise.all([
    getInvoiceForStaff(id),
    getInvoiceBankingSettings(),
  ]);

  if (error || !invoice) notFound();

  const patient = (Array.isArray(invoice.patients) ? invoice.patients[0] : invoice.patients) as
    | {
        first_name?: string;
        last_name?: string;
        email?: string | null;
        postal_address?: string | null;
      }
    | null
    | undefined;

  const patientName = patient
    ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
    : "Patient";

  const rawLines = (invoice.invoice_line_items ?? []) as Array<{
    description: string;
    quantity: number;
    unit_price_cents: number;
    amount_cents: number;
    treatment_code: string | null;
  }>;

  const lines: InvoiceDocumentLine[] = rawLines.map((line) => ({
    description: line.description,
    quantity: Number(line.quantity) || 1,
    unitPriceCents: line.unit_price_cents,
    amountCents: line.amount_cents,
    treatmentCode: line.treatment_code,
  }));

  if (!lines.length && invoice.notes) {
    lines.push({
      description: invoice.notes,
      quantity: 1,
      unitPriceCents: invoice.subtotal_cents,
      amountCents: invoice.subtotal_cents,
    });
  }

  const payments = invoice.payments ?? [];
  const amountPaidCents = payments.reduce(
    (sum: number, p: { amount_cents: number }) => sum + p.amount_cents,
    0,
  );
  const latestPayment = payments[0] as
    | { method?: string; paid_at?: string; amount_cents?: number }
    | undefined;
  const isReceipt = invoice.status === "paid";
  const canEdit = EDITABLE_INVOICE_STATUSES.has(invoice.status);
  const initials = patientName
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  const refDate = invoice.issue_date.replaceAll("-", "").slice(2);
  const reference = `${initials}${refDate}`;

  return (
    <div className="space-y-6">
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.admin.billing}>Back to billing</Link>
          </Button>
          <h1 className="mt-3 font-display text-2xl font-semibold">
            {isReceipt ? "Receipt" : "Invoice"} {invoice.invoice_number}
          </h1>
        </div>
        <InvoiceDocumentToolbar invoiceId={invoice.id} canSend />
      </div>

      {canEdit ? (
        <InvoiceLineEditor
          invoiceId={invoice.id}
          initialLines={
            lines.length
              ? lines.map((line) => ({
                  description: line.description,
                  quantity: line.quantity,
                  unitPriceCents: line.unitPriceCents,
                }))
              : [
                  {
                    description: invoice.notes || "Physiotherapy consultation",
                    quantity: 1,
                    unitPriceCents: invoice.subtotal_cents,
                  },
                ]
          }
        />
      ) : (
        <p className="print:hidden text-sm text-muted-foreground">
          This invoice is {invoice.status} and cannot be edited. Create a new invoice for
          additional charges.
        </p>
      )}

      <InvoiceReceiptDocument
        variant={isReceipt ? "receipt" : "invoice"}
        invoiceNumber={invoice.invoice_number}
        reference={reference}
        issueDate={invoice.issue_date}
        dueDate={invoice.due_date}
        practiceName={siteConfig.practiceName}
        practiceAddress={`${siteConfig.address}, ${siteConfig.region}`}
        patientName={patientName}
        patientAddress={patient?.postal_address}
        lines={lines}
        subtotalCents={invoice.subtotal_cents}
        taxCents={invoice.tax_cents}
        totalCents={invoice.total_cents}
        amountPaidCents={amountPaidCents || (isReceipt ? invoice.total_cents : 0)}
        paymentMethod={latestPayment?.method}
        paidAt={latestPayment?.paid_at}
        banking={banking}
      />
    </div>
  );
}
