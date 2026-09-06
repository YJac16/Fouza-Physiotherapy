"use client";

import { useEffect } from "react";

import { invoicePrintDocumentTitle } from "@/features/billing/lib/invoice-print";

export function InvoicePrintTitle({
  invoiceNumber,
  patientName,
}: {
  invoiceNumber: string;
  patientName?: string | null;
}) {
  const title = invoicePrintDocumentTitle(invoiceNumber, patientName);

  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return null;
}
