"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import type { DiscountMode } from "@/features/billing/lib/discounts";
import type { LineDiscountResult } from "@/features/billing/lib/discounts";
import { formatZar, centsToRandsInput, randsToCents } from "@/features/billing/lib/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { discountForMode, SELECT_CLASS, type EditableLine } from "./types";

type Props = {
  line: EditableLine;
  lineTotal?: LineDiscountResult;
  index: number;
  canRemove: boolean;
  onUpdate: (patch: Partial<EditableLine>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
};

export function InvoiceLineCard({
  line,
  lineTotal,
  index,
  canRemove,
  onUpdate,
  onRemove,
  onDuplicate,
}: Props) {
  const [showCodes, setShowCodes] = useState(
    Boolean(line.treatmentCode?.trim() || line.icd10Code?.trim()),
  );

  function adjustQuantity(delta: number) {
    const next = Math.max(0.01, Math.round((line.quantity + delta) * 100) / 100);
    onUpdate({ quantity: next });
  }

  return (
    <div className="space-y-3 rounded-xl border border-border/80 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Line {index + 1}
        </p>
        <p className="text-right text-sm font-medium">{line.description || "Custom item"}</p>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`desc-${line.key}`}>Description</Label>
        <Input
          id={`desc-${line.key}`}
          value={line.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`qty-${line.key}`}>Quantity</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => adjustQuantity(-1)}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            id={`qty-${line.key}`}
            type="number"
            min={0.01}
            step="any"
            inputMode="decimal"
            className="text-center"
            value={line.quantity}
            onChange={(e) => onUpdate({ quantity: Number(e.target.value) || 0 })}
            required
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            onClick={() => adjustQuantity(1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor={`price-${line.key}`}>Unit price</Label>
        <Input
          id={`price-${line.key}`}
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={centsToRandsInput(line.unitPriceCents)}
          onChange={(e) => onUpdate({ unitPriceCents: randsToCents(e.target.value) })}
          required
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`disc-mode-${line.key}`}>Discount</Label>
          <select
            id={`disc-mode-${line.key}`}
            className={SELECT_CLASS}
            value={line.discount.mode}
            onChange={(e) =>
              onUpdate({ discount: discountForMode(e.target.value as DiscountMode) })
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
              inputMode="decimal"
              value={line.discount.percent ?? 0}
              onChange={(e) =>
                onUpdate({
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
              inputMode="decimal"
              value={centsToRandsInput(line.discount.amountCents ?? 0)}
              onChange={(e) =>
                onUpdate({
                  discount: {
                    ...line.discount,
                    amountCents: randsToCents(e.target.value),
                  },
                })
              }
            />
          </div>
        ) : null}
      </div>

      <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
        {(lineTotal?.discountCents ?? 0) > 0 ? (
          <div className="flex justify-between gap-2 text-muted-foreground">
            <span>Gross</span>
            <span>{formatZar(lineTotal?.grossCents ?? 0)}</span>
          </div>
        ) : null}
        {(lineTotal?.discountCents ?? 0) > 0 ? (
          <div className="flex justify-between gap-2 text-muted-foreground">
            <span>Discount</span>
            <span>-{formatZar(lineTotal?.discountCents ?? 0)}</span>
          </div>
        ) : null}
        <div className="flex justify-between gap-2 font-medium">
          <span>Line total</span>
          <span>{formatZar(lineTotal?.amountCents ?? 0)}</span>
        </div>
      </div>

      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto px-0 text-muted-foreground"
          onClick={() => setShowCodes((prev) => !prev)}
        >
          {showCodes ? "Hide codes" : "Treatment code / ICD-10"}
        </Button>
        {showCodes ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor={`treatment-${line.key}`}>Treatment code</Label>
              <Input
                id={`treatment-${line.key}`}
                value={line.treatmentCode ?? ""}
                onChange={(e) => onUpdate({ treatmentCode: e.target.value })}
                placeholder="Optional, e.g. FC001"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`icd10-${line.key}`}>ICD-10</Label>
              <Input
                id={`icd10-${line.key}`}
                value={line.icd10Code ?? ""}
                onChange={(e) => onUpdate({ icd10Code: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
          Duplicate
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={!canRemove}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}
