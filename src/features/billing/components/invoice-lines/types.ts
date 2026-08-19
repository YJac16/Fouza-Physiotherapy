import type { DiscountInput, DiscountMode } from "@/features/billing/lib/discounts";

export type InvoiceServiceOption = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  description?: string | null;
};

export type EditableLine = {
  key: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  serviceId?: string | null;
  treatmentCode?: string | null;
  icd10Code?: string | null;
  discount: DiscountInput;
};

export const EMPTY_DISCOUNT: DiscountInput = { mode: "none", percent: null, amountCents: 0 };

export const SELECT_CLASS =
  "flex h-11 w-full rounded-xl border border-input bg-card px-3 text-sm";

export function randKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function discountForMode(mode: DiscountMode): DiscountInput {
  if (mode === "percent") return { mode: "percent", percent: 0, amountCents: 0 };
  if (mode === "amount") return { mode: "amount", percent: null, amountCents: 0 };
  return EMPTY_DISCOUNT;
}

export function createLineFromService(service: InvoiceServiceOption): EditableLine {
  return {
    key: randKey(),
    description: service.name,
    quantity: 1,
    unitPriceCents: service.priceCents,
    serviceId: service.id,
    treatmentCode: null,
    icd10Code: null,
    discount: EMPTY_DISCOUNT,
  };
}

export function createBlankLine(): EditableLine {
  return {
    key: randKey(),
    description: "",
    quantity: 1,
    unitPriceCents: 0,
    serviceId: null,
    treatmentCode: null,
    icd10Code: null,
    discount: EMPTY_DISCOUNT,
  };
}

export function serializeLines(lines: EditableLine[]) {
  return JSON.stringify(
    lines.map(
      ({ description, quantity, unitPriceCents, serviceId, treatmentCode, icd10Code, discount }) => ({
        description,
        quantity,
        unitPriceCents,
        serviceId: serviceId ?? null,
        treatmentCode: treatmentCode?.trim() || null,
        icd10Code: icd10Code?.trim() || null,
        discountMode: discount.mode,
        discountPercent: discount.mode === "percent" ? discount.percent : null,
        discountAmountCents: discount.mode === "amount" ? discount.amountCents : 0,
      }),
    ),
  );
}

export function serializeInvoiceDiscount(
  invoiceDiscount: DiscountInput,
  discountNote: string,
) {
  return JSON.stringify({
    mode: invoiceDiscount.mode,
    percent: invoiceDiscount.mode === "percent" ? invoiceDiscount.percent : null,
    amountCents: invoiceDiscount.mode === "amount" ? invoiceDiscount.amountCents : 0,
    note: discountNote.trim() || null,
  });
}
