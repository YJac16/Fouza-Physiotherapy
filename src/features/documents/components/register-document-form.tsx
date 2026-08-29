"use client";

import { useActionState, useState } from "react";

import {
  registerDocumentAction,
  type DocumentActionState,
} from "@/features/documents/actions/documents";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/ui/search-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initial: DocumentActionState = {};

export function RegisterDocumentForm({
  patients,
}: {
  patients: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(registerDocumentAction, initial);
  const [patientId, setPatientId] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h5">Register document</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid max-w-lg gap-4">
          <input type="hidden" name="patientId" value={patientId} />
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient</Label>
            <SearchSelect
              id="patientId"
              options={patients.map((patient) => ({
                value: patient.id,
                label: patient.label,
              }))}
              value={patientId}
              onValueChange={setPatientId}
              placeholder="Search patient…"
              searchPlaceholder="Search by name…"
              emptyMessage="No matching patients"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input id="filename" name="filename" placeholder="report.pdf" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="docType">Document type</Label>
            <Input id="docType" name="docType" defaultValue="general" />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPatientVisible"
              name="isPatientVisible"
              value="true"
              className="size-4 rounded border-input"
            />
            <Label htmlFor="isPatientVisible" className="font-normal">
              Visible to patient in portal
            </Label>
          </div>
          {state.error ? <FormMessage tone="error">{state.error}</FormMessage> : null}
          {state.success ? <FormMessage tone="success">{state.success}</FormMessage> : null}
          <Button type="submit" loading={pending} disabled={!patientId}>
            Register document
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
