"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import {
  emptyObjective,
  emptySubjective,
  type ObjectiveAssessment,
  type RegionAnnotation,
  type SubjectiveAssessment,
} from "@/features/initial-assessments/schemas/assessment";
import { routes } from "@/config/routes";

const initial: AssessmentActionState = {};

export type AssessmentPatientSnapshot = {
  name: string;
  idNumber?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  contact?: string | null;
};

type AssessmentFormProps = {
  patients: { id: string; label: string }[];
  practitioners: { id: string; label: string }[];
  defaultPatientId?: string;
  assessmentId?: string;
  patientSnapshot?: AssessmentPatientSnapshot;
  defaults?: {
    painScale?: number | null;
    plan?: string;
    practitionerId?: string;
    appointmentId?: string | null;
    regionNotes?: RegionAnnotation[];
    subjective?: SubjectiveAssessment;
    objective?: ObjectiveAssessment;
  };
};

function NoteField({
  id,
  name,
  label,
  defaultValue,
  rows = 3,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-foreground">
        {label}
      </Label>
      <Textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="text-base text-foreground sm:text-sm"
      />
    </div>
  );
}

function ClearingField({
  id,
  name,
  label,
  defaultValue,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="h-11 text-base sm:text-sm"
      />
    </div>
  );
}

export function AssessmentForm({
  patients,
  practitioners,
  defaultPatientId,
  assessmentId,
  patientSnapshot,
  defaults,
}: AssessmentFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(upsertInitialAssessmentAction, initial);
  const [view, setView] = useState<BodyView>("anterior");
  const [annotations, setAnnotations] = useState<RegionAnnotation[]>(defaults?.regionNotes ?? []);
  const [editing, setEditing] = useState<{ regionId: string; view: BodyView } | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [draftPain, setDraftPain] = useState<string>("");
  const subjective = defaults?.subjective ?? emptySubjective();
  const objective = defaults?.objective ?? emptyObjective();

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

      {patientSnapshot ? (
        <section className="grid gap-3 rounded-2xl border border-border bg-card p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Patient name</p>
            <p className="mt-1 font-medium">{patientSnapshot.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ID number</p>
            <p className="mt-1 font-medium">{patientSnapshot.idNumber || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Address</p>
            <p className="mt-1 font-medium">{patientSnapshot.address || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date of birth</p>
            <p className="mt-1 font-medium">
              {patientSnapshot.dateOfBirth
                ? new Date(patientSnapshot.dateOfBirth).toLocaleDateString("en-ZA")
                : "—"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact details</p>
            <p className="mt-1 font-medium">{patientSnapshot.contact || "—"}</p>
          </div>
        </section>
      ) : null}

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

      <div>
        <h2 className="font-display text-xl font-semibold">Subjective assessment</h2>
        <p className="text-sm text-muted-foreground">Staff only — not shown in the patient portal.</p>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["subjective-body", "subjective-present"]}
        className="rounded-2xl border border-border px-4"
      >
        <AccordionItem value="subjective-body">
          <AccordionTrigger>Body chart</AccordionTrigger>
          <AccordionContent className="text-foreground">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Tap a region to add notes</p>
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
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="subjective-present">
          <AccordionTrigger>Present history</AccordionTrigger>
          <AccordionContent className="space-y-4 text-foreground">
            <NoteField id="ph_kind" name="ph_kind" label="Kind of disorder and history" defaultValue={subjective.presentHistory.kindOfDisorder} rows={4} />
            <NoteField id="ph_aggravating" name="ph_aggravating" label="Aggravating factors" defaultValue={subjective.presentHistory.aggravatingFactors} />
            <NoteField id="ph_easing" name="ph_easing" label="Easing factors" defaultValue={subjective.presentHistory.easingFactors} />
            <NoteField id="ph_24h" name="ph_24h" label="24 hour behaviour" defaultValue={subjective.presentHistory.twentyFourHourBehaviour} />
            <NoteField id="ph_sin" name="ph_sin" label="SIN (severity, irritability, nature)" defaultValue={subjective.presentHistory.sin} />
            <NoteField id="ph_mech" name="ph_mech" label="Mechanical / inflammatory" defaultValue={subjective.presentHistory.mechanicalInflammatory} rows={2} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="subjective-special">
          <AccordionTrigger>Special questions</AccordionTrigger>
          <AccordionContent className="space-y-4 text-foreground">
            <NoteField id="sq_red" name="sq_red" label="Red flags" defaultValue={subjective.specialQuestions.redFlags} />
            <NoteField id="sq_yellow" name="sq_yellow" label="Yellow flags" defaultValue={subjective.specialQuestions.yellowFlags} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="subjective-resources">
          <AccordionTrigger>Other resources and comparable symptom</AccordionTrigger>
          <AccordionContent className="space-y-4 text-foreground">
            <NoteField id="other_resources" name="other_resources" label="Other resources (X-ray / MRI / blood tests)" defaultValue={subjective.otherResources} />
            <NoteField id="comparable_symptom" name="comparable_symptom" label="Comparable symptom" defaultValue={subjective.comparableSymptom} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="subjective-past">
          <AccordionTrigger>Past medical and surgical history</AccordionTrigger>
          <AccordionContent className="space-y-4 text-foreground">
            <NoteField id="pm_comorbidities" name="pm_comorbidities" label="Comorbidities" defaultValue={subjective.pastHistory.comorbidities} />
            <NoteField id="pm_medications" name="pm_medications" label="Medications" defaultValue={subjective.pastHistory.medications} />
            <NoteField id="pm_previous" name="pm_previous" label="Previous episodes / treatment" defaultValue={subjective.pastHistory.previousEpisodes} rows={4} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="subjective-social">
          <AccordionTrigger>Social history</AccordionTrigger>
          <AccordionContent className="space-y-4 text-foreground">
            <NoteField id="so_home" name="so_home" label="Home environment" defaultValue={subjective.socialHistory.homeEnvironment} rows={2} />
            <NoteField id="so_occupation" name="so_occupation" label="Occupation" defaultValue={subjective.socialHistory.occupation} rows={2} />
            <NoteField id="so_hobbies" name="so_hobbies" label="Hobbies" defaultValue={subjective.socialHistory.hobbies} rows={2} />
            <NoteField id="so_family" name="so_family" label="Family" defaultValue={subjective.socialHistory.family} />
            <NoteField id="so_smoking" name="so_smoking" label="Smoking / alcohol / other" defaultValue={subjective.socialHistory.smokingAlcoholOther} rows={2} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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

      <div>
        <h2 className="font-display text-xl font-semibold">Objective assessment</h2>
        <p className="text-sm text-muted-foreground">Generic findings for any body region. Staff only.</p>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["objective-obs", "objective-functional"]}
        className="rounded-2xl border border-border px-4"
      >
        <AccordionItem value="objective-obs">
          <AccordionTrigger>Observations</AccordionTrigger>
          <AccordionContent className="space-y-4 text-foreground">
            <NoteField id="ob_general" name="ob_general" label="General" defaultValue={objective.observations.general} rows={4} />
            <NoteField id="ob_local" name="ob_local" label="Local" defaultValue={objective.observations.local} rows={4} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="objective-functional">
          <AccordionTrigger>Functional demonstration / tests</AccordionTrigger>
          <AccordionContent className="text-foreground">
            <NoteField id="functional_tests" name="functional_tests" label="Findings" defaultValue={objective.functionalTests} rows={5} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="objective-clearing">
          <AccordionTrigger>Clearing tests</AccordionTrigger>
          <AccordionContent className="space-y-6 text-foreground">
            <div className="space-y-3">
              <p className="text-sm font-semibold">Cervical spine</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ClearingField id="ct_cervical_flex" name="ct_cervical_flex" label="Flex" defaultValue={objective.clearingTests.cervical.flex} />
                <ClearingField id="ct_cervical_ext" name="ct_cervical_ext" label="Ext" defaultValue={objective.clearingTests.cervical.ext} />
                <ClearingField id="ct_cervical_sflex_l" name="ct_cervical_sflex_l" label="S/flex L" defaultValue={objective.clearingTests.cervical.sflexL} />
                <ClearingField id="ct_cervical_sflex_r" name="ct_cervical_sflex_r" label="S/flex R" defaultValue={objective.clearingTests.cervical.sflexR} />
                <ClearingField id="ct_cervical_rot_l" name="ct_cervical_rot_l" label="Rot L" defaultValue={objective.clearingTests.cervical.rotL} />
                <ClearingField id="ct_cervical_rot_r" name="ct_cervical_rot_r" label="Rot R" defaultValue={objective.clearingTests.cervical.rotR} />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold">Shoulder</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ClearingField id="ct_shoulder_flex" name="ct_shoulder_flex" label="Flex" defaultValue={objective.clearingTests.shoulder.flex} />
                <ClearingField id="ct_shoulder_abd" name="ct_shoulder_abd" label="Abd" defaultValue={objective.clearingTests.shoulder.abd} />
                <ClearingField id="ct_shoulder_hbb" name="ct_shoulder_hbb" label="HBB" defaultValue={objective.clearingTests.shoulder.hbb} />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold">Wrist</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ClearingField id="ct_wrist_flex" name="ct_wrist_flex" label="Flex" defaultValue={objective.clearingTests.wrist.flex} />
                <ClearingField id="ct_wrist_ext" name="ct_wrist_ext" label="Ext" defaultValue={objective.clearingTests.wrist.ext} />
                <ClearingField id="ct_wrist_radial" name="ct_wrist_radial" label="Radial dev." defaultValue={objective.clearingTests.wrist.radialDev} />
                <ClearingField id="ct_wrist_ulnar" name="ct_wrist_ulnar" label="Ulnar dev." defaultValue={objective.clearingTests.wrist.ulnarDev} />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="objective-movements">
          <AccordionTrigger>Active and passive movements</AccordionTrigger>
          <AccordionContent className="text-foreground">
            <NoteField id="active_passive" name="active_passive" label="Findings" defaultValue={objective.activePassiveMovements} rows={4} placeholder="Record AROM / PROM for the relevant region…" />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="objective-tests">
          <AccordionTrigger>Isometric, special tests, and flexibility</AccordionTrigger>
          <AccordionContent className="space-y-4 text-foreground">
            <NoteField id="isometric" name="isometric" label="Isometric testing" defaultValue={objective.isometricTesting} rows={4} />
            <NoteField id="special_tests" name="special_tests" label="Special tests" defaultValue={objective.specialTests} rows={4} placeholder="Name the test and record the result…" />
            <NoteField id="flexibility" name="flexibility" label="Flexibility test" defaultValue={objective.flexibility} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="objective-exam">
          <AccordionTrigger>Palpation, muscle, and neurological tests</AccordionTrigger>
          <AccordionContent className="space-y-4 text-foreground">
            <NoteField id="palpation" name="palpation" label="Palpation" defaultValue={objective.palpation} />
            <NoteField id="muscle_testing" name="muscle_testing" label="Muscle testing" defaultValue={objective.muscleTesting} />
            <NoteField id="neurological" name="neurological" label="Neurological tests" defaultValue={objective.neurologicalTests} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="objective-outcome">
          <AccordionTrigger>Additional movements and outcome measures</AccordionTrigger>
          <AccordionContent className="space-y-4 text-foreground">
            <NoteField id="additional_movements" name="additional_movements" label="Additional movements" defaultValue={objective.additionalMovements} />
            <NoteField id="outcome_measures" name="outcome_measures" label="Outcome measure(s) / comparable sign(s)" defaultValue={objective.outcomeMeasures} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
        <div className="mx-auto flex max-w-4xl gap-2">
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
