"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  sendInvoiceEmailAction,
  voidInvoiceAction,
} from "@/features/billing/actions/billing";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

export function InvoiceDocumentToolbar({
  invoiceId,
  canSend = false,
  canVoid = false,
}: {
  invoiceId: string;
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
    if (
      !window.confirm(
        "Void this invoice? It will be removed from billing totals and cannot be edited.",
      )
    ) {
      return;
    }

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
          <Button
            type="button"
            variant="outline"
            loading={voidPending}
            onClick={handleVoid}
            className="text-destructive hover:text-destructive"
          >
            Void invoice
          </Button>
        ) : null}
      </div>
      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}
    </div>
  );
}
