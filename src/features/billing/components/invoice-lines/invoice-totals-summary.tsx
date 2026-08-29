import type { InvoiceTotals } from "@/features/billing/lib/discounts";
import { formatZar } from "@/features/billing/lib/money";

type Props = {
  totals: InvoiceTotals;
  className?: string;
};

export function InvoiceTotalsSummary({ totals, className }: Props) {
  return (
    <div className={className ?? "space-y-1 text-sm"}>
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">Subtotal</span>
        <span>{formatZar(totals.grossCents)}</span>
      </div>
      {totals.lineDiscountCents > 0 ? (
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Line discounts</span>
          <span>-{formatZar(totals.lineDiscountCents)}</span>
        </div>
      ) : null}
      {totals.invoiceDiscountCents > 0 ? (
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Invoice discount</span>
          <span>-{formatZar(totals.invoiceDiscountCents)}</span>
        </div>
      ) : null}
      <div className="flex justify-between gap-4">
        <span className="text-muted-foreground">VAT</span>
        <span>{formatZar(totals.taxCents)}</span>
      </div>
      <div className="flex justify-between gap-4 border-t border-border pt-2 font-semibold">
        <span>TOTAL</span>
        <span>{formatZar(totals.totalCents)}</span>
      </div>
    </div>
  );
}
