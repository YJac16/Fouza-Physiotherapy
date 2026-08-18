"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deletePatientAction,
  type PatientActionState,
} from "@/features/patients/actions/patients";

const initial: PatientActionState = {};

export function DeletePatientForm({
  patientId,
  fullName,
  counts,
}: {
  patientId: string;
  fullName: string;
  counts: { appointments: number; invoices: number; payments: number };
}) {
  const [state, action, pending] = useActionState(deletePatientAction, initial);
  const [confirmationName, setConfirmationName] = useState("");
  const matches =
    confirmationName.trim().replace(/\s+/g, " ").toLowerCase() ===
    fullName.trim().replace(/\s+/g, " ").toLowerCase();

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-h5 text-destructive">Delete patient</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="id" value={patientId} />
          <p className="text-sm text-muted-foreground">
            Permanently remove this test or unused record, including appointments, invoices,
            payments, clinical notes, and assessments. This cannot be undone.
          </p>
          <p className="text-sm text-muted-foreground">
            Linked records: {counts.appointments} appointments, {counts.invoices} invoices,{" "}
            {counts.payments} payments.
          </p>
          <div className="space-y-2">
            <Label htmlFor="confirmationName">
              Type <span className="font-medium text-foreground">{fullName}</span> to confirm
            </Label>
            <Input
              id="confirmationName"
              name="confirmationName"
              value={confirmationName}
              onChange={(event) => setConfirmationName(event.target.value)}
              autoComplete="off"
              className="h-11 text-base sm:text-sm"
            />
          </div>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <Button type="submit" variant="danger" disabled={pending || !matches}>
            {pending ? "Deleting…" : "Delete patient"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
