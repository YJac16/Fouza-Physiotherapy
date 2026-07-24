"use client";

import { useActionState } from "react";

import {
  registerDocumentAction,
  type DocumentActionState,
} from "@/features/documents/actions/documents";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initial: DocumentActionState = {};

export function RegisterDocumentForm() {
  const [state, action, pending] = useActionState(registerDocumentAction, initial);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h5">Register document</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid max-w-lg gap-4">
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID</Label>
            <Input id="patientId" name="patientId" required placeholder="UUID" />
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
          <Button type="submit" loading={pending}>
            Register document
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
