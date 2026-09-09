"use client";

import { useEffect } from "react";

import { letterPrintDocumentTitle } from "@/features/clinical-letters/lib/print";
import type { ClinicalLetterType } from "@/features/clinical-letters/types/letter";

export function LetterPrintTitle({
  letterType,
  patientName,
  letterDate,
}: {
  letterType: ClinicalLetterType;
  patientName?: string | null;
  letterDate?: string | null;
}) {
  const title = letterPrintDocumentTitle(letterType, patientName, letterDate);

  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);

  return null;
}
