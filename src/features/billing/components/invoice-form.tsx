"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createInvoiceAction,
  type BillingActionState,
} from "@/features/billing/actions/billing";

const initial: BillingActionState = {};

export function InvoiceForm({
  patients,
}: {
  patients: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(createInvoiceAction, initial);

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
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required rows={3} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subtotalCents">Amount (cents)</Label>
          <Input id="subtotalCents" name="subtotalCents" type="number" min={0} required defaultValue={70000} />
          <p className="text-xs text-muted-foreground">e.g. 70000 = R700.00</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxCents">Tax (cents)</Label>
          <Input id="taxCents" name="taxCents" type="number" min={0} defaultValue={0} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="treatmentCode">Treatment code</Label>
          <Input id="treatmentCode" name="treatmentCode" placeholder="Optional" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="icd10Code">ICD-10</Label>
          <Input id="icd10Code" name="icd10Code" placeholder="Optional" />
        </div>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create invoice"}
      </Button>
    </form>
  );
}
