"use client";

import type { DiscountInput, DiscountMode } from "@/features/billing/lib/discounts";
import { centsToRandsInput, randsToCents } from "@/features/billing/lib/money";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { discountForMode, SELECT_CLASS } from "./types";

type Props = {
  invoiceDiscount: DiscountInput;
  discountNote: string;
  onDiscountChange: (discount: DiscountInput) => void;
  onNoteChange: (note: string) => void;
  taxCents?: number;
  onTaxChange?: (taxCents: number) => void;
  showTax?: boolean;
};

export function InvoiceDiscountSection({
  invoiceDiscount,
  discountNote,
  onDiscountChange,
  onNoteChange,
  taxCents = 0,
  onTaxChange,
  showTax = false,
}: Props) {
  return (
    <div className="space-y-3 rounded-xl border border-border/80 p-3">
      <p className="text-sm font-medium">Invoice discount</p>
      <div className="grid gap-2 md:grid-cols-[8rem_8rem_1fr]">
        <div className="space-y-1">
          <Label htmlFor="invoice-disc-mode">Type</Label>
          <select
            id="invoice-disc-mode"
            className={SELECT_CLASS}
            value={invoiceDiscount.mode}
            onChange={(e) => onDiscountChange(discountForMode(e.target.value as DiscountMode))}
          >
            <option value="none">None</option>
            <option value="percent">Percent</option>
            <option value="amount">Rand</option>
          </select>
        </div>
        {invoiceDiscount.mode === "percent" ? (
          <div className="space-y-1">
            <Label htmlFor="invoice-disc-pct">Discount %</Label>
            <Input
              id="invoice-disc-pct"
              type="number"
              min={0}
              max={100}
              step="0.01"
              inputMode="decimal"
              value={invoiceDiscount.percent ?? 0}
              onChange={(e) =>
                onDiscountChange({
                  ...invoiceDiscount,
                  percent: Number(e.target.value || 0),
                })
              }
            />
          </div>
        ) : null}
        {invoiceDiscount.mode === "amount" ? (
          <div className="space-y-1">
            <Label htmlFor="invoice-disc-amt">Discount (R)</Label>
            <Input
              id="invoice-disc-amt"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={centsToRandsInput(invoiceDiscount.amountCents ?? 0)}
              onChange={(e) =>
                onDiscountChange({
                  ...invoiceDiscount,
                  amountCents: randsToCents(e.target.value),
                })
              }
            />
          </div>
        ) : null}
        <div className="space-y-1 md:col-span-1">
          <Label htmlFor="invoice-disc-note">Discount note</Label>
          <Input
            id="invoice-disc-note"
            value={discountNote}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Optional, e.g. Family rate"
            maxLength={200}
          />
        </div>
      </div>
      {showTax && onTaxChange ? (
        <div className="space-y-1">
          <Label htmlFor="invoice-tax">VAT (R)</Label>
          <Input
            id="invoice-tax"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={centsToRandsInput(taxCents)}
            onChange={(e) => onTaxChange(randsToCents(e.target.value))}
          />
        </div>
      ) : null}
    </div>
  );
}
