"use client";

import { useCallback, useState } from "react";

import { discountInputFromStored } from "@/features/billing/lib/discounts";

import {
  createBlankLine,
  createLineFromService,
  EMPTY_DISCOUNT,
  type EditableLine,
  type InvoiceServiceOption,
  randKey,
} from "./types";

type InitialLine = {
  description: string;
  quantity: number;
  unitPriceCents: number;
  serviceId?: string | null;
  treatmentCode?: string | null;
  icd10Code?: string | null;
  discountPercent?: number | string | null;
  discountCents?: number | null;
};

export function useInvoiceLines(initialLines: InitialLine[] = []) {
  const [lines, setLines] = useState<EditableLine[]>(() =>
    initialLines.length
      ? initialLines.map((line) => ({
          key: randKey(),
          description: line.description,
          quantity: line.quantity || 1,
          unitPriceCents: line.unitPriceCents,
          serviceId: line.serviceId ?? null,
          treatmentCode: line.treatmentCode ?? null,
          icd10Code: line.icd10Code ?? null,
          discount: discountInputFromStored({
            percent: line.discountPercent,
            cents: line.discountCents,
          }),
        }))
      : [],
  );

  const updateLine = useCallback((key: string, patch: Partial<EditableLine>) => {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  }, []);

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((line) => line.key !== key));
  }, []);

  const duplicateLine = useCallback((key: string) => {
    setLines((prev) => {
      const source = prev.find((line) => line.key === key);
      if (!source) return prev;
      const copy: EditableLine = {
        ...source,
        key: randKey(),
        discount: { ...source.discount },
      };
      const index = prev.findIndex((line) => line.key === key);
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
  }, []);

  const addService = useCallback((service: InvoiceServiceOption) => {
    setLines((prev) => [...prev, createLineFromService(service)]);
  }, []);

  const addCustomLine = useCallback(() => {
    setLines((prev) => [...prev, createBlankLine()]);
  }, []);

  const setAllLines = useCallback((next: EditableLine[]) => {
    setLines(next);
  }, []);

  return {
    lines,
    setLines,
    setAllLines,
    updateLine,
    removeLine,
    duplicateLine,
    addService,
    addCustomLine,
  };
}

export { EMPTY_DISCOUNT };
