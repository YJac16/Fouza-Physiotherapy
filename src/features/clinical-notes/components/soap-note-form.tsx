"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertClinicalNoteAction,
  type NoteActionState,
} from "@/features/clinical-notes/actions/notes";

const initial: NoteActionState = {};

export function SoapNoteForm({
  patients,
  practitioners,
  defaultPatientId,
  noteId,
  defaults,
}: {
  patients: { id: string; label: string }[];
  practitioners: { id: string; label: string }[];
  defaultPatientId?: string;
  noteId?: string;
  defaults?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    practitionerId?: string;
    appointmentId?: string | null;
  };
}) {
  const [state, action, pending] = useActionState(upsertClinicalNoteAction, initial);

  return (
    <form action={action} className="space-y-4">
      {noteId ? <input type="hidden" name="id" value={noteId} /> : null}
      {defaults?.appointmentId ? (
        <input type="hidden" name="appointmentId" value={defaults.appointmentId} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="patientId">Patient</Label>
          <select
            id="patientId"
            name="patientId"
            required
            defaultValue={defaultPatientId}
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
          <Label htmlFor="practitionerId">Practitioner</Label>
          <select
            id="practitionerId"
            name="practitionerId"
            required
            defaultValue={defaults?.practitionerId}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">Select practitioner</option>
            {practitioners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(["subjective", "objective", "assessment", "plan"] as const).map((field) => (
        <div key={field} className="space-y-2">
          <Label htmlFor={field} className="capitalize">
            {field}
          </Label>
          <Textarea
            id={field}
            name={field}
            rows={4}
            defaultValue={defaults?.[field] ?? ""}
            placeholder={`${field} findings…`}
          />
        </div>
      ))}

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : noteId ? "Update note" : "Create note"}
      </Button>
    </form>
  );
}
