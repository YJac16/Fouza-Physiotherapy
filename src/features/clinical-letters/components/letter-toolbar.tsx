"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { sendLetterAction } from "@/features/clinical-letters/actions/letters";
import { letterPrintDocumentTitle } from "@/features/clinical-letters/lib/print";
import type { ClinicalLetterType } from "@/features/clinical-letters/types/letter";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

export function LetterDocumentToolbar({
  letterId,
  letterType,
  patientName,
  letterDate,
  canSend = false,
  canPrint = false,
}: {
  letterId: string;
  letterType: ClinicalLetterType;
  patientName: string;
  letterDate?: string | null;
  canSend?: boolean;
  canPrint?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  function handlePrint() {
    document.title = letterPrintDocumentTitle(letterType, patientName, letterDate);
    window.print();
  }

  function handleSend() {
    startTransition(async () => {
      const result = await sendLetterAction(letterId);
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: result.success ?? "Sent" });
      router.refresh();
    });
  }

  return (
    <div className="print:hidden space-y-3">
      <div className="flex flex-wrap gap-2">
        {canPrint ? (
          <Button type="button" onClick={handlePrint}>
            Download / Print PDF
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Sign the letter to download or send it.</p>
        )}
        {canSend ? (
          <Button type="button" variant="outline" loading={pending} onClick={handleSend}>
            Send to patient
          </Button>
        ) : null}
      </div>
      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}
    </div>
  );
}
