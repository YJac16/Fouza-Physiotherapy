import Link from "next/link";
import { notFound } from "next/navigation";

import {
  InvoiceReceiptDocument,
  type InvoiceDocumentLine,
} from "@/features/billing/components/invoice-document";
import { InvoiceDocumentToolbar } from "@/features/billing/components/invoice-toolbar";
import { InvoiceLineEditor } from "@/features/billing/components/invoice-line-editor";
import { listActiveInvoiceServices } from "@/features/billing/actions/billing";
import { EDITABLE_INVOICE_STATUSES } from "@/features/billing/lib/addons";
import { invoicePaymentReference } from "@/features/billing/lib/invoice-print";
import { totalsFromStoredInvoice } from "@/features/billing/lib/discounts";
import {
  getInvoiceBankingSettings,
  getInvoiceForStaff,
  getInvoicePracticeIdentifiers,
} from "@/features/billing/lib/invoice-data";
import { InvoicePrintTitle } from "@/features/billing/components/invoice-print-title";
import {
  invoiceDisplayLabel,
  invoiceDisplayStatus,
  invoiceOutstandingCents,
  invoicePaidCents,
} from "@/features/analytics/lib/finance";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminInvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [{ invoice, error }, banking, services, practiceIds] = await Promise.all([
    getInvoiceForStaff(id),
    getInvoiceBankingSettings(),
    listActiveInvoiceServices(),
    getInvoicePracticeIdentifiers(),
  ]);

  if (error || !invoice) notFound();

  const patient = (Array.isArray(invoice.patients) ? invoice.patients[0] : invoice.patients) as
    | {
        first_name?: string;
        last_name?: string;
        email?: string | null;
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
  const billingName = patient?.billing_name?.trim() || null;
  const recipientName = billingName || patientName;
  const useBillingAsRecipient = Boolean(billingName);

  const rawLines = (invoice.invoice_line_items ?? []) as Array<{
    description: string;
    quantity: number;
    unit_price_cents: number;
    amount_cents: number;
    treatment_code: string | null;
    icd10_code?: string | null;
    service_id?: string | null;
    discount_percent?: number | string | null;
    discount_cents?: number | null;
  }>;

  const lines: InvoiceDocumentLine[] = rawLines.map((line) => ({
    description: line.description,
    quantity: Number(line.quantity) || 1,
    unitPriceCents: line.unit_price_cents,
    amountCents: line.amount_cents,
    treatmentCode: line.treatment_code,
    discountPercent: line.discount_percent == null ? null : Number(line.discount_percent),
    discountCents: line.discount_cents ?? 0,
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
  const amountPaidCents = invoicePaidCents(payments);
  const computed = totalsFromStoredInvoice({
    lines: rawLines,
    invoiceDiscountPercent: invoice.discount_percent,
    invoiceDiscountCents: invoice.discount_cents,
    taxCents: invoice.tax_cents,
    fallbackSubtotalCents: invoice.subtotal_cents,
  });
  const payableCents = computed.displayTotalCents;
  const outstandingCents = invoiceOutstandingCents(payableCents, amountPaidCents);
  const displayStatus = invoiceDisplayStatus({
    status: invoice.status,
    totalCents: payableCents,
    paidCents: amountPaidCents,
  });
  const latestPayment = [...payments].sort((a, b) =>
    String(b.paid_at ?? "").localeCompare(String(a.paid_at ?? "")),
  )[0] as { method?: string; paid_at?: string; amount_cents?: number } | undefined;
  const isReceipt = displayStatus === "paid";
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
          <p className="text-sm text-muted-foreground">
            {invoiceDisplayLabel(displayStatus)}
            {displayStatus === "partially_paid"
              ? ` · outstanding R ${(outstandingCents / 100).toFixed(2)}`
              : ""}
            {" · "}
            Payment reference: {invoicePaymentReference(invoice.invoice_number)}
          </p>
        </div>
        <InvoiceDocumentToolbar
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoice_number}
          patientName={recipientName}
          canSend
          canVoid={canEdit && invoice.status !== "void"}
        />
      </div>

      {canEdit ? (
        <InvoiceLineEditor
          invoiceId={invoice.id}
          services={services}
          taxCents={invoice.tax_cents}
          initialInvoiceDiscount={{
            percent: invoice.discount_percent,
            cents: invoice.discount_cents,
            note: invoice.discount_note,
          }}
          initialLines={
            lines.length
              ? lines.map((line, index) => ({
                  description: line.description,
                  quantity: line.quantity,
                  unitPriceCents: line.unitPriceCents,
                  serviceId: rawLines[index]?.service_id ?? null,
                  treatmentCode: rawLines[index]?.treatment_code ?? null,
                  icd10Code: rawLines[index]?.icd10_code ?? null,
                  discountPercent: line.discountPercent,
                  discountCents: line.discountCents,
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

      <InvoicePrintTitle invoiceNumber={invoice.invoice_number} patientName={recipientName} />

      <div id="preview" className="invoice-print-root">
        <InvoiceReceiptDocument
        variant={isReceipt ? "receipt" : "invoice"}
        invoiceNumber={invoice.invoice_number}
        reference={reference}
        issueDate={invoice.issue_date}
        dueDate={invoice.due_date}
        practiceName={siteConfig.practiceName}
        practiceAddress={`${siteConfig.address}, ${siteConfig.region}`}
        practiceNumber={practiceIds.practiceNumber}
        ptNumber={practiceIds.ptNumber}
        practiceVatNumber={practiceIds.vatNumber}
        patientName={recipientName}
        patientPostalAddress={patient?.postal_address}
        patientPhysicalAddress={patient?.billing_address}
        accountHolderName={useBillingAsRecipient ? undefined : billingName}
        accountHolderEmail={useBillingAsRecipient ? undefined : patient?.billing_email}
        lines={lines}
        subtotalCents={computed.displaySubtotalCents}
        taxCents={invoice.tax_cents}
        totalCents={payableCents}
        discountCents={computed.displayDiscountCents}
        amountPaidCents={amountPaidCents}
        balanceDueCents={outstandingCents}
        paymentMethod={latestPayment?.method}
        paidAt={latestPayment?.paid_at}
        banking={banking}
        />
      </div>
    </div>
  );
}
