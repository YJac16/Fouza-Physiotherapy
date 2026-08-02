"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { sendInvoiceEmailAction } from "@/features/billing/actions/billing";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

export function InvoiceDocumentToolbar({
  invoiceId,
  canSend = false,
}: {
  invoiceId: string;
  canSend?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
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
      </div>
      {message ? <FormMessage tone={message.tone}>{message.text}</FormMessage> : null}
    </div>
  );
}
