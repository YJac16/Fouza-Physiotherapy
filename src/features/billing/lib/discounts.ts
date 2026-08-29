export type DiscountMode = "none" | "percent" | "amount";

export type DiscountInput = {
  mode: DiscountMode;
  percent?: number | null;
  amountCents?: number | null;
};

export type DiscountableLine = {
  quantity: number;
  unitPriceCents: number;
  discount?: DiscountInput;
};

export type LineDiscountResult = {
  grossCents: number;
  discountCents: number;
  discountPercent: number | null;
  amountCents: number;
};

export type InvoiceTotals = {
  lines: LineDiscountResult[];
  /** Sum of quantity × unit price, before any discounts. */
  grossCents: number;
  lineDiscountCents: number;
  /** Net after line discounts, before invoice-level discount and tax. Stored as invoices.subtotal_cents. */
  subtotalCents: number;
  invoiceDiscountCents: number;
  invoiceDiscountPercent: number | null;
  totalDiscountCents: number;
  taxCents: number;
  totalCents: number;
};

function asNumber(value: number | string | null | undefined) {
  if (value == null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function clampDiscountPercent(value: number | string | null | undefined) {
  const parsed = asNumber(value);
  if (parsed == null || parsed <= 0) return null;
  return Math.min(100, parsed);
}

export function lineGrossCents(quantity: number, unitPriceCents: number) {
  return Math.max(0, Math.round(quantity * unitPriceCents));
}

export function resolveDiscount(grossCents: number, discount?: DiscountInput | null) {
  const safeGross = Math.max(0, Math.round(grossCents));
  const mode = discount?.mode ?? "none";

  if (safeGross <= 0 || mode === "none") {
    return { discountCents: 0, discountPercent: null as number | null };
  }

  if (mode === "percent") {
    const percent = clampDiscountPercent(discount?.percent);
    if (!percent) return { discountCents: 0, discountPercent: null };
    return {
      discountCents: Math.min(safeGross, Math.round((safeGross * percent) / 100)),
      discountPercent: percent,
    };
  }

  const amountCents = Math.max(0, Math.round(asNumber(discount?.amountCents) ?? 0));
  return {
    discountCents: Math.min(safeGross, amountCents),
    discountPercent: null as number | null,
  };
}

export function lineTotals(line: DiscountableLine): LineDiscountResult {
  const grossCents = lineGrossCents(line.quantity, line.unitPriceCents);
  const { discountCents, discountPercent } = resolveDiscount(grossCents, line.discount);
  return {
    grossCents,
    discountCents,
    discountPercent,
    amountCents: Math.max(0, grossCents - discountCents),
  };
}

export function invoiceTotalsFromLines(input: {
  lines: DiscountableLine[];
  invoiceDiscount?: DiscountInput | null;
  taxCents?: number;
}): InvoiceTotals {
  const lines = input.lines.map(lineTotals);
  const grossCents = lines.reduce((sum, line) => sum + line.grossCents, 0);
  const lineDiscountCents = lines.reduce((sum, line) => sum + line.discountCents, 0);
  const subtotalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  const invoiceResolved = resolveDiscount(subtotalCents, input.invoiceDiscount);
  const taxCents = Math.max(0, Math.round(input.taxCents ?? 0));

  return {
    lines,
    grossCents,
    lineDiscountCents,
    subtotalCents,
    invoiceDiscountCents: invoiceResolved.discountCents,
    invoiceDiscountPercent: invoiceResolved.discountPercent,
    totalDiscountCents: lineDiscountCents + invoiceResolved.discountCents,
    taxCents,
    totalCents: Math.max(0, subtotalCents - invoiceResolved.discountCents + taxCents),
  };
}

export function discountInputFromStored(input?: {
  percent?: number | string | null;
  cents?: number | string | null;
} | null): DiscountInput {
  const percent = clampDiscountPercent(input?.percent);
  const cents = Math.max(0, Math.round(asNumber(input?.cents) ?? 0));
  if (percent) return { mode: "percent", percent, amountCents: 0 };
  if (cents > 0) return { mode: "amount", percent: null, amountCents: cents };
  return { mode: "none", percent: null, amountCents: 0 };
}

export function invoiceDocumentTotals(input: {
  lines: DiscountableLine[];
  invoiceDiscount?: DiscountInput | null;
  taxCents?: number;
}) {
  const totals = invoiceTotalsFromLines(input);
  return {
    ...totals,
    displaySubtotalCents: totals.grossCents,
    displayDiscountCents: totals.totalDiscountCents,
    displayTotalCents: totals.totalCents,
  };
}

export function totalsFromStoredInvoice(input: {
  lines: Array<{
    quantity: number;
    unit_price_cents: number;
    discount_percent?: number | string | null;
    discount_cents?: number | null;
  }>;
  invoiceDiscountPercent?: number | string | null;
  invoiceDiscountCents?: number | null;
  taxCents?: number;
  fallbackSubtotalCents?: number;
}) {
  const lines: DiscountableLine[] = input.lines.length
    ? input.lines.map((line) => ({
        quantity: Number(line.quantity) || 1,
        unitPriceCents: line.unit_price_cents,
        discount: discountInputFromStored({
          percent: line.discount_percent,
          cents: line.discount_cents,
        }),
      }))
    : [{ quantity: 1, unitPriceCents: input.fallbackSubtotalCents ?? 0 }];

  return invoiceDocumentTotals({
    lines,
    invoiceDiscount: discountInputFromStored({
      percent: input.invoiceDiscountPercent,
      cents: input.invoiceDiscountCents,
    }),
    taxCents: input.taxCents,
  });
}
