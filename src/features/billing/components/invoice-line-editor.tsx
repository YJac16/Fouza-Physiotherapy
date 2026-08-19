"use client";

import { useActionState, useMemo, useState } from "react";

import {
  updateInvoiceLineItemsAction,
  type BillingActionState,
  type InvoiceServiceOption,
} from "@/features/billing/actions/billing";
import { discountInputFromStored, invoiceTotalsFromLines } from "@/features/billing/lib/discounts";
import {
  InvoiceDiscountSection,
  InvoiceLineCard,
  InvoiceTotalsSummary,
  ServicePicker,
  serializeInvoiceDiscount,
  serializeLines,
  useInvoiceLines,
} from "@/features/billing/components/invoice-lines";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

const initial: BillingActionState = {};

type Props = {
  invoiceId: string;
  services?: InvoiceServiceOption[];
  initialLines: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    serviceId?: string | null;
    treatmentCode?: string | null;
    icd10Code?: string | null;
    discountPercent?: number | string | null;
    discountCents?: number | null;
  }>;
  initialInvoiceDiscount?: {
    percent?: number | string | null;
    cents?: number | null;
    note?: string | null;
  };
  taxCents?: number;
};

export function InvoiceLineEditor({
  invoiceId,
  services = [],
  initialLines,
  initialInvoiceDiscount,
  taxCents = 0,
}: Props) {
  const [state, action, pending] = useActionState(updateInvoiceLineItemsAction, initial);
  const {
    lines,
    updateLine,
    removeLine,
    duplicateLine,
    addService,
    addCustomLine,
  } = useInvoiceLines(initialLines);
  const [invoiceDiscount, setInvoiceDiscount] = useState(() =>
    discountInputFromStored({
      percent: initialInvoiceDiscount?.percent,
      cents: initialInvoiceDiscount?.cents,
    }),
  );
  const [discountNote, setDiscountNote] = useState(initialInvoiceDiscount?.note ?? "");

  const totals = useMemo(
    () =>
      invoiceTotalsFromLines({
        lines: lines.map((line) => ({
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
          discount: line.discount,
        })),
        invoiceDiscount,
        taxCents,
      }),
    [invoiceDiscount, lines, taxCents],
  );

  return (
    <form
      id="edit-lines"
      action={action}
      className="print:hidden space-y-4 rounded-2xl border border-border p-4"
    >
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <input type="hidden" name="linesJson" value={serializeLines(lines)} />
      <input
        type="hidden"
        name="invoiceDiscountJson"
        value={serializeInvoiceDiscount(invoiceDiscount, discountNote)}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Edit line items</h2>
          <p className="text-sm text-muted-foreground">
            Add services, adjust quantities and discounts, then save your changes.
          </p>
        </div>
        <div className="hidden sm:block">
          <InvoiceTotalsSummary totals={totals} />
        </div>
      </div>

      <ServicePicker
        services={services}
        onSelectService={addService}
        onAddCustom={addCustomLine}
      />

      <div className="space-y-3">
        {lines.map((line, index) => (
          <InvoiceLineCard
            key={line.key}
            line={line}
            lineTotal={totals.lines[index]}
            index={index}
            canRemove={lines.length > 1}
            onUpdate={(patch) => updateLine(line.key, patch)}
            onRemove={() => removeLine(line.key)}
            onDuplicate={() => duplicateLine(line.key)}
          />
        ))}
      </div>

      <InvoiceDiscountSection
        invoiceDiscount={invoiceDiscount}
        discountNote={discountNote}
        onDiscountChange={setInvoiceDiscount}
        onNoteChange={setDiscountNote}
      />

      <section className="rounded-xl border border-border p-4 sm:hidden">
        <InvoiceTotalsSummary totals={totals} />
      </section>

      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
      {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}

      <Button type="submit" loading={pending} disabled={!lines.length}>
        Save invoice changes
      </Button>
    </form>
  );
}
