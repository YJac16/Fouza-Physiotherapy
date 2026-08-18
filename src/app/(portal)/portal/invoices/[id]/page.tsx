import { notFound } from "next/navigation";
import Link from "next/link";

import {
  InvoiceReceiptDocument,
  type InvoiceDocumentLine,
} from "@/features/billing/components/invoice-document";
import { InvoiceDocumentToolbar } from "@/features/billing/components/invoice-toolbar";
import {
  getInvoiceBankingSettings,
  getInvoiceForPatient,
} from "@/features/billing/lib/invoice-data";
import {
  invoiceDisplayStatus,
  invoiceOutstandingCents,
  invoicePaidCents,
} from "@/features/analytics/lib/finance";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

type PageProps = { params: Promise<{ id: string }> };

export default async function PortalInvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [{ invoice, error }, banking] = await Promise.all([
    getInvoiceForPatient(id),
    getInvoiceBankingSettings(),
  ]);

  if (error || !invoice) notFound();

  const patient = (Array.isArray(invoice.patients) ? invoice.patients[0] : invoice.patients) as
    | {
        first_name?: string;
        last_name?: string;
        postal_address?: string | null;
        billing_name?: string | null;
        billing_email?: string | null;
        billing_address?: string | null;
      }
    | null
    | undefined;

  const patientName = patient
    ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
    : "Patient";

  const lines: InvoiceDocumentLine[] = (invoice.invoice_line_items ?? []).map(
    (line: {
      description: string;
      quantity: number;
      unit_price_cents: number;
      amount_cents: number;
      treatment_code: string | null;
      discount_percent?: number | string | null;
      discount_cents?: number | null;
    }) => ({
      description: line.description,
      quantity: Number(line.quantity) || 1,
      unitPriceCents: line.unit_price_cents,
      amountCents: line.amount_cents,
      treatmentCode: line.treatment_code,
      discountPercent: line.discount_percent == null ? null : Number(line.discount_percent),
      discountCents: line.discount_cents ?? 0,
    }),
  );

  if (!lines.length && invoice.notes) {
    lines.push({
      description: invoice.notes,
      quantity: 1,
      unitPriceCents: invoice.subtotal_cents,
      amountCents: invoice.subtotal_cents,
    });
  }

  const payments = invoice.payments ?? [];
  const amountPaidCents = invoicePaidCents(payments);
  const outstandingCents = invoiceOutstandingCents(invoice.total_cents, amountPaidCents);
  const displayStatus = invoiceDisplayStatus({
    status: invoice.status,
    totalCents: invoice.total_cents,
    paidCents: amountPaidCents,
  });
  const latestPayment = payments[0] as
    | { method?: string; paid_at?: string }
    | undefined;
  const isReceipt = displayStatus === "paid";

  return (
    <div className="space-y-6">
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.portal.invoices}>Back to invoices</Link>
          </Button>
          <h1 className="mt-3 font-display text-2xl font-semibold">
            {isReceipt ? "Receipt" : "Invoice"} {invoice.invoice_number}
          </h1>
        </div>
        <InvoiceDocumentToolbar invoiceId={invoice.id} />
      </div>

      <InvoiceReceiptDocument
        variant={isReceipt ? "receipt" : "invoice"}
        invoiceNumber={invoice.invoice_number}
        issueDate={invoice.issue_date}
        dueDate={invoice.due_date}
        practiceName={siteConfig.practiceName}
        practiceAddress={`${siteConfig.address}, ${siteConfig.region}`}
        patientName={patientName}
        patientAddress={patient?.billing_address || patient?.postal_address}
        accountHolderName={patient?.billing_name}
        accountHolderEmail={patient?.billing_email}
        lines={lines}
        subtotalCents={invoice.subtotal_cents}
        taxCents={invoice.tax_cents}
        totalCents={invoice.total_cents}
        discountCents={
          (invoice.discount_cents ?? 0) +
          lines.reduce((sum, line) => sum + (line.discountCents ?? 0), 0)
        }
        discountNote={invoice.discount_note}
        amountPaidCents={amountPaidCents}
        balanceDueCents={outstandingCents}
        paymentMethod={latestPayment?.method}
        paidAt={latestPayment?.paid_at}
        banking={banking}
      />
    </div>
  );
}
