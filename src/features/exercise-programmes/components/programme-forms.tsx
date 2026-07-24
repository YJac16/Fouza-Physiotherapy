"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createExerciseAction,
  createProgrammeAction,
  type ExerciseActionState,
} from "@/features/exercise-programmes/actions/programmes";

const initial: ExerciseActionState = {};

export function ExerciseLibraryForm() {
  const [state, action, pending] = useActionState(createExerciseAction, initial);
  return (
    <form action={action} className="space-y-3 rounded-2xl border border-border p-4">
      <h3 className="font-display text-lg font-semibold">Add exercise</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required placeholder="ankle-circles" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea id="instructions" name="instructions" rows={3} />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add to library"}
      </Button>
    </form>
  );
}

export function AssignProgrammeForm({
  patients,
  practitioners,
}: {
  patients: { id: string; label: string }[];
  practitioners: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState(createProgrammeAction, initial);
  return (
    <form action={action} className="space-y-3 rounded-2xl border border-border p-4">
      <h3 className="font-display text-lg font-semibold">Assign programme</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
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
        <div className="space-y-1">
          <Label htmlFor="practitionerId">Practitioner</Label>
          <select
            id="practitionerId"
            name="practitionerId"
            required
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">Select</option>
            {practitioners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="firstExercise">First exercise name</Label>
        <Input id="firstExercise" name="firstExercise" placeholder="Optional starter exercise" />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Assigning…" : "Assign programme"}
      </Button>
    </form>
  );
}
