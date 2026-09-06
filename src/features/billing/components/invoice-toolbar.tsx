"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  sendInvoiceEmailAction,
  voidInvoiceAction,
} from "@/features/billing/actions/billing";
import { invoicePrintDocumentTitle } from "@/features/billing/lib/invoice-print";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

export function InvoiceDocumentToolbar({
  invoiceId,
  invoiceNumber,
  patientName,
  canSend = false,
  canVoid = false,
}: {
  invoiceId: string;
  invoiceNumber: string;
  patientName: string;
  canSend?: boolean;
  canVoid?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [voidPending, startVoidTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(
    null,
  );

  function handlePrint() {
    document.title = invoicePrintDocumentTitle(invoiceNumber, patientName);
    window.print();
  }

  function handleSend() {
    startTransition(async () => {
      const result = await sendInvoiceEmailAction(invoiceId);
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: result.success ?? "Sent" });
      router.refresh();
    });
  }

  function handleVoid() {
    startVoidTransition(async () => {
      const result = await voidInvoiceAction(invoiceId);
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
        return;
      }
      setMessage({ tone: "success", text: result.success ?? "Voided" });
      router.refresh();
    });
  }

  return (
    <div className="print:hidden space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handlePrint}>
          Download / Print PDF
        </Button>
        {canSend ? (
          <Button type="button" variant="outline" loading={pending} onClick={handleSend}>
            Send to patient
          </Button>
        ) : null}
        {canVoid ? (
          <ConfirmAction
            label="Void invoice"
            confirmLabel="Yes, void invoice"
            description="Void this invoice? It will be removed from billing totals and cannot be edited."
            pending={voidPending}
            onConfirm={handleVoid}
            variant="outline"
            className="text-destructive hover:text-destructive"
          />
        ) : null}
      </div>
      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}
    </div>
  );
}
