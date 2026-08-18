"use client";

import { useActionState, useMemo, useState } from "react";

import {
  updateInvoiceLineItemsAction,
  type BillingActionState,
} from "@/features/billing/actions/billing";
import { INVOICE_ADDONS } from "@/features/billing/lib/addons";
import {
  discountInputFromStored,
  invoiceTotalsFromLines,
  type DiscountInput,
  type DiscountMode,
} from "@/features/billing/lib/discounts";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMPTY_DISCOUNT: DiscountInput = { mode: "none", percent: null, amountCents: 0 };

const SELECT_CLASS = "flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm";

export type EditableLine = {
  key: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  serviceId?: string | null;
  discount: DiscountInput;
};

type Props = {
  invoiceId: string;
  initialLines: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
    serviceId?: string | null;
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

const initial: BillingActionState = {};

function randKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function rands(cents: number) {
  return (cents / 100).toFixed(2);
}

function discountForMode(mode: DiscountMode): DiscountInput {
  if (mode === "percent") return { mode: "percent", percent: 0, amountCents: 0 };
  if (mode === "amount") return { mode: "amount", percent: null, amountCents: 0 };
  return EMPTY_DISCOUNT;
}

export function InvoiceLineEditor({
  invoiceId,
  initialLines,
  initialInvoiceDiscount,
  taxCents = 0,
}: Props) {
  const [state, action, pending] = useActionState(updateInvoiceLineItemsAction, initial);
  const [lines, setLines] = useState<EditableLine[]>(() =>
    initialLines.map((line) => ({
      key: randKey(),
      description: line.description,
      quantity: line.quantity || 1,
      unitPriceCents: line.unitPriceCents,
      serviceId: line.serviceId ?? null,
      discount: discountInputFromStored({
        percent: line.discountPercent,
        cents: line.discountCents,
      }),
    })),
  );
  const [invoiceDiscount, setInvoiceDiscount] = useState<DiscountInput>(() =>
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

  function updateLine(key: string, patch: Partial<EditableLine>) {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((line) => line.key !== key)));
  }

  function addBlank() {
    setLines((prev) => [
      ...prev,
      { key: randKey(), description: "", quantity: 1, unitPriceCents: 0, discount: EMPTY_DISCOUNT },
    ]);
  }

  function addAddon(
    addon: (typeof INVOICE_ADDONS)[keyof typeof INVOICE_ADDONS],
    opts?: { quantity?: number; unitPriceCents?: number },
  ) {
    setLines((prev) => [
      ...prev,
      {
        key: randKey(),
        description: addon.description,
        quantity: opts?.quantity ?? addon.defaultQuantity,
        unitPriceCents: opts?.unitPriceCents ?? addon.unitPriceCents,
        discount: EMPTY_DISCOUNT,
      },
    ]);
  }

  const linesJson = JSON.stringify(
    lines.map(({ description, quantity, unitPriceCents, serviceId, discount }) => ({
      description,
      quantity,
      unitPriceCents,
      serviceId: serviceId ?? null,
      discountMode: discount.mode,
      discountPercent: discount.mode === "percent" ? discount.percent : null,
      discountAmountCents: discount.mode === "amount" ? discount.amountCents : 0,
    })),
  );

  const invoiceDiscountJson = JSON.stringify({
    mode: invoiceDiscount.mode,
    percent: invoiceDiscount.mode === "percent" ? invoiceDiscount.percent : null,
    amountCents: invoiceDiscount.mode === "amount" ? invoiceDiscount.amountCents : 0,
    note: discountNote.trim() || null,
  });

  return (
    <form action={action} className="print:hidden space-y-4 rounded-2xl border border-border p-4">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <input type="hidden" name="linesJson" value={linesJson} />
      <input type="hidden" name="invoiceDiscountJson" value={invoiceDiscountJson} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Edit line items</h2>
          <p className="text-sm text-muted-foreground">
            Add home visits, needling, or a referral letter, and apply line or invoice discounts.
          </p>
        </div>
        <div className="text-right text-sm">
          <p>Subtotal R {rands(totals.subtotalCents)}</p>
          <p className="text-muted-foreground">Discount R {rands(totals.totalDiscountCents)}</p>
          <p className="font-medium">Total R {rands(totals.totalCents)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addAddon(INVOICE_ADDONS.homeVisitConsultation)}
        >
          + Home visit consultation (R1000)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addAddon(INVOICE_ADDONS.homeFollowUp)}
        >
          + Home follow-up (R900)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addAddon(INVOICE_ADDONS.dryNeedling)}
        >
          + Dry needling (R80)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addAddon(INVOICE_ADDONS.needles, { quantity: 1, unitPriceCents: 0 })}
        >
          + Needles (qty)
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addAddon(INVOICE_ADDONS.referralLetter)}
        >
          + Referral letter (R100)
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={addBlank}>
          + Custom line
        </Button>
      </div>

      <div className="space-y-3">
        {lines.map((line, index) => {
          const lineTotal = totals.lines[index];
          return (
            <div key={line.key} className="space-y-2 rounded-xl border border-border/80 p-3">
              <div className="grid gap-2 md:grid-cols-[1fr_5rem_7rem_auto]">
                <div className="space-y-1">
                  <Label htmlFor={`desc-${line.key}`}>Description</Label>
                  <Input
                    id={`desc-${line.key}`}
                    value={line.description}
                    onChange={(e) => updateLine(line.key, { description: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`qty-${line.key}`}>Qty</Label>
                  <Input
                    id={`qty-${line.key}`}
                    type="number"
                    min={0.01}
                    step="any"
                    value={line.quantity}
                    onChange={(e) =>
                      updateLine(line.key, { quantity: Number(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`price-${line.key}`}>Unit (R)</Label>
                  <Input
                    id={`price-${line.key}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={(line.unitPriceCents / 100).toFixed(2)}
                    onChange={(e) =>
                      updateLine(line.key, {
                        unitPriceCents: Math.round(Number(e.target.value || 0) * 100),
                      })
                    }
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLine(line.key)}
                    disabled={lines.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-[8rem_8rem_1fr]">
                <div className="space-y-1">
                  <Label htmlFor={`disc-mode-${line.key}`}>Line discount</Label>
                  <select
                    id={`disc-mode-${line.key}`}
                    className={SELECT_CLASS}
                    value={line.discount.mode}
                    onChange={(e) =>
                      updateLine(line.key, { discount: discountForMode(e.target.value as DiscountMode) })
                    }
                  >
                    <option value="none">None</option>
                    <option value="percent">Percent</option>
                    <option value="amount">Rand</option>
                  </select>
                </div>
                {line.discount.mode === "percent" ? (
                  <div className="space-y-1">
                    <Label htmlFor={`disc-pct-${line.key}`}>Discount %</Label>
                    <Input
                      id={`disc-pct-${line.key}`}
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={line.discount.percent ?? 0}
                      onChange={(e) =>
                        updateLine(line.key, {
                          discount: {
                            ...line.discount,
                            percent: Number(e.target.value || 0),
                          },
                        })
                      }
                    />
                  </div>
                ) : null}
                {line.discount.mode === "amount" ? (
                  <div className="space-y-1">
                    <Label htmlFor={`disc-amt-${line.key}`}>Discount (R)</Label>
                    <Input
                      id={`disc-amt-${line.key}`}
                      type="number"
                      min={0}
                      step="0.01"
                      value={rands(line.discount.amountCents ?? 0)}
                      onChange={(e) =>
                        updateLine(line.key, {
                          discount: {
                            ...line.discount,
                            amountCents: Math.round(Number(e.target.value || 0) * 100),
                          },
                        })
                      }
                    />
                  </div>
                ) : null}
                <p className="self-end text-xs text-muted-foreground md:text-right">
                  Line total R {rands(lineTotal?.amountCents ?? 0)}
                  {(lineTotal?.discountCents ?? 0) > 0
                    ? ` (was R ${rands(lineTotal?.grossCents ?? 0)})`
                    : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-2 rounded-xl border border-border/80 p-3 md:grid-cols-[8rem_8rem_1fr]">
        <div className="space-y-1">
          <Label htmlFor="invoice-disc-mode">Invoice discount</Label>
          <select
            id="invoice-disc-mode"
            className={SELECT_CLASS}
            value={invoiceDiscount.mode}
            onChange={(e) => setInvoiceDiscount(discountForMode(e.target.value as DiscountMode))}
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
              value={invoiceDiscount.percent ?? 0}
              onChange={(e) =>
                setInvoiceDiscount({
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
              value={rands(invoiceDiscount.amountCents ?? 0)}
              onChange={(e) =>
                setInvoiceDiscount({
                  ...invoiceDiscount,
                  amountCents: Math.round(Number(e.target.value || 0) * 100),
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
            onChange={(e) => setDiscountNote(e.target.value)}
            placeholder="Optional, e.g. Family rate"
            maxLength={200}
          />
        </div>
      </div>

      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
      {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}

      <Button type="submit" loading={pending} disabled={!lines.length}>
        Save invoice changes
      </Button>
    </form>
  );
}
