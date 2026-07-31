"use client";

import { useActionState, useMemo, useState } from "react";

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
        <Input
          id="category"
          name="category"
          placeholder="ankle, hip, knee, lumbar…"
          list="exercise-categories"
        />
        <datalist id="exercise-categories">
          <option value="ankle" />
          <option value="hip" />
          <option value="knee" />
          <option value="lumbar" />
        </datalist>
      </div>
      <div className="space-y-1">
        <Label htmlFor="mediaUrl">Video URL or storage path (optional)</Label>
        <Input
          id="mediaUrl"
          name="mediaUrl"
          placeholder="lower-limb/hip/hip-isometric-abd-add.mp4"
        />
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

type LibraryExercise = {
  id: string;
  name: string;
  category: string | null;
  media_url: string | null;
};

export function AssignProgrammeForm({
  patients,
  practitioners,
  exercises,
}: {
  patients: { id: string; label: string }[];
  practitioners: { id: string; label: string }[];
  exercises: LibraryExercise[];
}) {
  const [state, action, pending] = useActionState(createProgrammeAction, initial);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const categories = useMemo(() => {
    const set = new Set(
      exercises.map((e) => e.category?.trim().toLowerCase()).filter(Boolean) as string[],
    );
    return Array.from(set).sort();
  }, [exercises]);

  const filtered = useMemo(() => {
    if (categoryFilter === "all") return exercises;
    return exercises.filter(
      (e) => (e.category ?? "").trim().toLowerCase() === categoryFilter,
    );
  }, [exercises, categoryFilter]);

  function toggleExercise(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  }

  return (
    <form action={action} className="space-y-3 rounded-2xl border border-border p-4">
      <h3 className="font-display text-lg font-semibold">Assign programme</h3>
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="exerciseIds" value={id} />
      ))}
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
        <Input id="title" name="title" required placeholder="Hip recovery week 1" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={2} />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>
            Exercises from library
            {selectedIds.length ? (
              <span className="ml-2 font-normal text-muted-foreground">
                ({selectedIds.length} selected)
              </span>
            ) : null}
          </Label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
            aria-label="Filter by injury region"
          >
            <option value="all">All regions</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        {!filtered.length ? (
          <p className="text-sm text-muted-foreground">
            No library exercises yet. Add videos to the library first, then select them here by
            injury region.
          </p>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
            {filtered.map((exercise) => (
              <label
                key={exercise.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/60"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(exercise.id)}
                  onChange={(e) => toggleExercise(exercise.id, e.target.checked)}
                  className="mt-1 size-4 rounded border-input"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{exercise.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {[exercise.category, exercise.media_url ? "Has video" : "No video"]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="sets">Sets</Label>
          <Input id="sets" name="sets" type="number" min={0} placeholder="3" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="reps">Reps</Label>
          <Input id="reps" name="reps" type="number" min={0} placeholder="10" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="holdSeconds">Hold (sec)</Label>
          <Input id="holdSeconds" name="holdSeconds" type="number" min={0} placeholder="0" />
        </div>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      <Button type="submit" disabled={pending || !exercises.length || !selectedIds.length}>
        {pending ? "Assigning…" : "Assign programme"}
      </Button>
    </form>
  );
}
