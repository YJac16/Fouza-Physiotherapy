"use client";

import { useActionState, useMemo, useState } from "react";

import {
  updateInvoiceLineItemsAction,
  type BillingActionState,
} from "@/features/billing/actions/billing";
import { INVOICE_ADDONS } from "@/features/billing/lib/addons";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EditableLine = {
  key: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
};

type Props = {
  invoiceId: string;
  initialLines: Array<{
    description: string;
    quantity: number;
    unitPriceCents: number;
  }>;
};

const initial: BillingActionState = {};

function randKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function rands(cents: number) {
  return (cents / 100).toFixed(2);
}

export function InvoiceLineEditor({ invoiceId, initialLines }: Props) {
  const [state, action, pending] = useActionState(updateInvoiceLineItemsAction, initial);
  const [lines, setLines] = useState<EditableLine[]>(() =>
    initialLines.map((line) => ({
      key: randKey(),
      description: line.description,
      quantity: line.quantity || 1,
      unitPriceCents: line.unitPriceCents,
    })),
  );

  const subtotalCents = useMemo(
    () => lines.reduce((sum, line) => sum + Math.round(line.quantity * line.unitPriceCents), 0),
    [lines],
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
      { key: randKey(), description: "", quantity: 1, unitPriceCents: 0 },
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
      },
    ]);
  }

  const linesJson = JSON.stringify(
    lines.map(({ description, quantity, unitPriceCents }) => ({
      description,
      quantity,
      unitPriceCents,
    })),
  );

  return (
    <form action={action} className="print:hidden space-y-4 rounded-2xl border border-border p-4">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <input type="hidden" name="linesJson" value={linesJson} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Edit line items</h2>
          <p className="text-sm text-muted-foreground">
            Adjust amounts or add needling, needles, or a referral letter.
          </p>
        </div>
        <p className="text-sm font-medium">Subtotal R {rands(subtotalCents)}</p>
      </div>

      <div className="flex flex-wrap gap-2">
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
        {lines.map((line) => (
          <div
            key={line.key}
            className="grid gap-2 rounded-xl border border-border/80 p-3 md:grid-cols-[1fr_5rem_7rem_auto]"
          >
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
            <p className="text-xs text-muted-foreground md:col-span-4">
              Line total R {rands(Math.round(line.quantity * line.unitPriceCents))}
            </p>
          </div>
        ))}
      </div>

      {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
      {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}

      <Button type="submit" loading={pending} disabled={!lines.length}>
        Save invoice changes
      </Button>
    </form>
  );
}
