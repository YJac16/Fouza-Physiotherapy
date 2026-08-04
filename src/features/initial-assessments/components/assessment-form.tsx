"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  upsertInitialAssessmentAction,
  type AssessmentActionState,
} from "@/features/initial-assessments/actions/assessments";
import { BodyDiagram } from "@/features/initial-assessments/components/body-diagram";
import {
  annotationKey,
  regionLabel,
  type BodyView,
} from "@/features/initial-assessments/lib/body-regions";
import type { RegionAnnotation } from "@/features/initial-assessments/schemas/assessment";
import { routes } from "@/config/routes";

const initial: AssessmentActionState = {};

type AssessmentFormProps = {
  patients: { id: string; label: string }[];
  practitioners: { id: string; label: string }[];
  defaultPatientId?: string;
  assessmentId?: string;
  defaults?: {
    chiefComplaint?: string;
    history?: string;
    painScale?: number | null;
    observations?: string;
    plan?: string;
    practitionerId?: string;
    appointmentId?: string | null;
    regionNotes?: RegionAnnotation[];
  };
};

export function AssessmentForm({
  patients,
  practitioners,
  defaultPatientId,
  assessmentId,
  defaults,
}: AssessmentFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(upsertInitialAssessmentAction, initial);
  const [view, setView] = useState<BodyView>("anterior");
  const [annotations, setAnnotations] = useState<RegionAnnotation[]>(defaults?.regionNotes ?? []);
  const [editing, setEditing] = useState<{ regionId: string; view: BodyView } | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [draftPain, setDraftPain] = useState<string>("");

  useEffect(() => {
    if (state.success && state.id && assessmentId) {
      router.refresh();
    }
  }, [state.success, state.id, assessmentId, router]);

  const selectedKey = editing ? annotationKey(editing.regionId, editing.view) : null;

  function openRegion(regionId: string, regionView: BodyView) {
    const existing = annotations.find(
      (a) => a.regionId === regionId && a.view === regionView,
    );
    setEditing({ regionId, view: regionView });
    setDraftNote(existing?.note ?? "");
    setDraftPain(existing?.pain != null ? String(existing.pain) : "");
  }

  function saveRegionNote() {
    if (!editing) return;
    const note = draftNote.trim();
    const painRaw = draftPain.trim();
    const pain = painRaw === "" ? null : Number(painRaw);

    setAnnotations((prev) => {
      const without = prev.filter(
        (a) => !(a.regionId === editing.regionId && a.view === editing.view),
      );
      if (!note) return without;
      return [
        ...without,
        {
          regionId: editing.regionId,
          view: editing.view,
          note,
          pain: Number.isFinite(pain) ? pain : null,
        },
      ];
    });
    setEditing(null);
  }

  function clearRegionNote() {
    if (!editing) return;
    setAnnotations((prev) =>
      prev.filter((a) => !(a.regionId === editing.regionId && a.view === editing.view)),
    );
    setEditing(null);
  }

  return (
    <>
    <form action={action} className="relative space-y-6 pb-28">
      {assessmentId ? <input type="hidden" name="id" value={assessmentId} /> : null}
      {defaults?.appointmentId ? (
        <input type="hidden" name="appointmentId" value={defaults.appointmentId} />
      ) : null}
      <input type="hidden" name="regionNotes" value={JSON.stringify(annotations)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="patientId">Patient</Label>
          <select
            id="patientId"
            name="patientId"
            required
            defaultValue={defaultPatientId}
            disabled={Boolean(assessmentId)}
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-base sm:text-sm disabled:opacity-70"
          >
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          {assessmentId ? (
            <input type="hidden" name="patientId" value={defaultPatientId ?? ""} />
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="practitionerId">Practitioner</Label>
          <select
            id="practitionerId"
            name="practitionerId"
            required
            defaultValue={defaults?.practitionerId}
            disabled={Boolean(assessmentId)}
            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-base sm:text-sm disabled:opacity-70"
          >
            <option value="">Select practitioner</option>
            {practitioners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          {assessmentId ? (
            <input type="hidden" name="practitionerId" value={defaults?.practitionerId ?? ""} />
          ) : null}
        </div>
      </div>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold">Body diagram</h2>
            <p className="text-xs text-muted-foreground">Tap a region to add notes</p>
          </div>
          <div className="flex rounded-xl border border-border p-0.5">
            {(["anterior", "posterior"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-2 text-sm font-medium touch-manipulation ${
                  view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                {v === "anterior" ? "Front" : "Back"}
              </button>
            ))}
          </div>
        </div>

        <BodyDiagram
          view={view}
          annotations={annotations}
          selectedKey={selectedKey}
          onSelectRegion={openRegion}
        />

        {annotations.length > 0 ? (
          <ul className="space-y-2 border-t border-border pt-3">
            {annotations.map((a) => (
              <li key={annotationKey(a.regionId, a.view)} className="text-sm">
                <button
                  type="button"
                  className="w-full rounded-lg px-2 py-2 text-left touch-manipulation hover:bg-muted/60"
                  onClick={() => {
                    setView(a.view);
                    openRegion(a.regionId, a.view);
                  }}
                >
                  <span className="font-medium">
                    {regionLabel(a.regionId, a.view)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      ({a.view === "anterior" ? "front" : "back"})
                    </span>
                    {a.pain != null ? (
                      <span className="ml-2 text-xs text-muted-foreground">Pain {a.pain}/10</span>
                    ) : null}
                  </span>
                  <p className="mt-0.5 line-clamp-2 text-muted-foreground [overflow-wrap:anywhere]">
                    {a.note}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-xs text-muted-foreground">No regions annotated yet</p>
        )}
      </section>

      <div className="space-y-2">
        <Label htmlFor="chiefComplaint">Chief complaint</Label>
        <Textarea
          id="chiefComplaint"
          name="chiefComplaint"
          rows={3}
          defaultValue={defaults?.chiefComplaint ?? ""}
          placeholder="Main reason for assessment…"
          className="text-base sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="history">History</Label>
        <Textarea
          id="history"
          name="history"
          rows={4}
          defaultValue={defaults?.history ?? ""}
          placeholder="Relevant history, onset, aggravating/easing factors…"
          className="text-base sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="painScale">Overall pain scale (0–10)</Label>
        <Input
          id="painScale"
          name="painScale"
          type="number"
          min={0}
          max={10}
          step={1}
          inputMode="numeric"
          defaultValue={defaults?.painScale ?? ""}
          className="h-11 text-base sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observations</Label>
        <Textarea
          id="observations"
          name="observations"
          rows={4}
          defaultValue={defaults?.observations ?? ""}
          placeholder="Objective findings, posture, ROM, special tests…"
          className="text-base sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan">Plan</Label>
        <Textarea
          id="plan"
          name="plan"
          rows={3}
          defaultValue={defaults?.plan ?? ""}
          placeholder="Treatment plan and next steps…"
          className="text-base sm:text-sm"
        />
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success && assessmentId ? (
        <p className="text-sm text-emerald-700">{state.success}</p>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-3xl gap-2">
          {assessmentId ? (
            <Button asChild type="button" variant="outline" className="flex-1 sm:flex-none">
              <Link href={routes.admin.initialAssessment(assessmentId)}>View</Link>
            </Button>
          ) : null}
          <Button type="submit" disabled={pending} className="w-full flex-1 sm:w-auto sm:flex-none">
            {pending ? "Saving…" : assessmentId ? "Update assessment" : "Save assessment"}
          </Button>
        </div>
      </div>
    </form>

      {editing ? (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="region-note-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setEditing(null);
          }}
        >
          <div className="w-full max-w-md rounded-t-2xl border border-border bg-background p-4 shadow-lg sm:rounded-2xl">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h3 id="region-note-title" className="font-display text-lg font-semibold">
                  {regionLabel(editing.regionId, editing.view)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editing.view === "anterior" ? "Front" : "Back"} view
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditing(null)}
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="regionNote">Note</Label>
                <Textarea
                  id="regionNote"
                  rows={4}
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder="Findings for this region…"
                  className="text-base sm:text-sm"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regionPain">Regional pain (0–10, optional)</Label>
                <Input
                  id="regionPain"
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  inputMode="numeric"
                  value={draftPain}
                  onChange={(e) => setDraftPain(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      saveRegionNote();
                    }
                  }}
                  className="h-11 text-base sm:text-sm"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" onClick={saveRegionNote} className="w-full sm:flex-1">
                  Save region
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearRegionNote}
                  className="w-full sm:w-auto"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
