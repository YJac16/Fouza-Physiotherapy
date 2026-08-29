"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  recordPaymentAction,
  type BillingActionState,
} from "@/features/billing/actions/billing";

const initial: BillingActionState = {};

export function PaymentForm({
  patients,
  invoices,
}: {
  patients: { id: string; label: string }[];
  invoices: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(recordPaymentAction, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patientId">Patient</Label>
        <select
          id="patientId"
          name="patientId"
          required
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
        >
          <option value="">Select</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="invoiceId">Invoice (optional)</Label>
        <select
          id="invoiceId"
          name="invoiceId"
          className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
        >
          <option value="">None</option>
          {invoices.map((i) => (
            <option key={i.id} value={i.id}>
              {i.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amountRands">Amount (R)</Label>
          <Input
            id="amountRands"
            name="amountRands"
            type="text"
            inputMode="decimal"
            required
            placeholder="2050 or 2050.00"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground">
            Enter rands — 2050 or 2050.00 is stored as R 2 050,00.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="method">Method</Label>
          <select
            id="method"
            name="method"
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            defaultValue="eft"
          >
            <option value="eft">EFT</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Recording…" : "Record payment"}
      </Button>
    </form>
  );
}
