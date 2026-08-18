import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BodyDiagram } from "@/features/initial-assessments/components/body-diagram";
import {
  annotationKey,
  regionLabel,
} from "@/features/initial-assessments/lib/body-regions";
import {
  parseObjective,
  parseSubjective,
  type ObjectiveAssessment,
  type RegionAnnotation,
  type SubjectiveAssessment,
} from "@/features/initial-assessments/schemas/assessment";
import { routes } from "@/config/routes";

function parseAnnotations(raw: unknown): RegionAnnotation[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is RegionAnnotation =>
      !!item &&
      typeof item === "object" &&
      typeof (item as RegionAnnotation).regionId === "string" &&
      ((item as RegionAnnotation).view === "anterior" ||
        (item as RegionAnnotation).view === "posterior") &&
      typeof (item as RegionAnnotation).note === "string",
  );
}

function NoteBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm [overflow-wrap:anywhere]">{value?.trim() || "—"}</p>
    </div>
  );
}

function ClearingGrid({
  title,
  fields,
}: {
  title: string;
  fields: Array<{ label: string; value?: string }>;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <NoteBlock key={field.label} label={field.label} value={field.value} />
        ))}
      </div>
    </div>
  );
}

function SubjectiveNotes({ subjective }: { subjective: SubjectiveAssessment }) {
  return (
    <div className="space-y-5">
      <h3 className="font-display text-base font-semibold">Present history</h3>
      <NoteBlock label="Kind of disorder and history" value={subjective.presentHistory.kindOfDisorder} />
      <NoteBlock label="Aggravating factors" value={subjective.presentHistory.aggravatingFactors} />
      <NoteBlock label="Easing factors" value={subjective.presentHistory.easingFactors} />
      <NoteBlock label="24 hour behaviour" value={subjective.presentHistory.twentyFourHourBehaviour} />
      <NoteBlock label="SIN (severity, irritability, nature)" value={subjective.presentHistory.sin} />
      <NoteBlock label="Mechanical / inflammatory" value={subjective.presentHistory.mechanicalInflammatory} />
      <h3 className="font-display text-base font-semibold">Special questions</h3>
      <NoteBlock label="Red flags" value={subjective.specialQuestions.redFlags} />
      <NoteBlock label="Yellow flags" value={subjective.specialQuestions.yellowFlags} />
      <NoteBlock label="Other resources (X-ray / MRI / blood tests)" value={subjective.otherResources} />
      <NoteBlock label="Comparable symptom" value={subjective.comparableSymptom} />
      <h3 className="font-display text-base font-semibold">Past medical and surgical history</h3>
      <NoteBlock label="Comorbidities" value={subjective.pastHistory.comorbidities} />
      <NoteBlock label="Medications" value={subjective.pastHistory.medications} />
      <NoteBlock label="Previous episodes / treatment" value={subjective.pastHistory.previousEpisodes} />
      <h3 className="font-display text-base font-semibold">Social history</h3>
      <NoteBlock label="Home environment" value={subjective.socialHistory.homeEnvironment} />
      <NoteBlock label="Occupation" value={subjective.socialHistory.occupation} />
      <NoteBlock label="Hobbies" value={subjective.socialHistory.hobbies} />
      <NoteBlock label="Family" value={subjective.socialHistory.family} />
      <NoteBlock label="Smoking / alcohol / other" value={subjective.socialHistory.smokingAlcoholOther} />
    </div>
  );
}

function ObjectiveNotes({ objective }: { objective: ObjectiveAssessment }) {
  return (
    <div className="space-y-5">
      <h3 className="font-display text-base font-semibold">Observations</h3>
      <NoteBlock label="General" value={objective.observations.general} />
      <NoteBlock label="Local" value={objective.observations.local} />
      <NoteBlock label="Functional demonstration / tests" value={objective.functionalTests} />
      <h3 className="font-display text-base font-semibold">Clearing tests</h3>
      <ClearingGrid
        title="Cervical spine"
        fields={[
          { label: "Flex", value: objective.clearingTests.cervical.flex },
          { label: "Ext", value: objective.clearingTests.cervical.ext },
          { label: "S/flex L", value: objective.clearingTests.cervical.sflexL },
          { label: "S/flex R", value: objective.clearingTests.cervical.sflexR },
          { label: "Rot L", value: objective.clearingTests.cervical.rotL },
          { label: "Rot R", value: objective.clearingTests.cervical.rotR },
        ]}
      />
      <ClearingGrid
        title="Shoulder"
        fields={[
          { label: "Flex", value: objective.clearingTests.shoulder.flex },
          { label: "Abd", value: objective.clearingTests.shoulder.abd },
          { label: "HBB", value: objective.clearingTests.shoulder.hbb },
        ]}
      />
      <ClearingGrid
        title="Wrist"
        fields={[
          { label: "Flex", value: objective.clearingTests.wrist.flex },
          { label: "Ext", value: objective.clearingTests.wrist.ext },
          { label: "Radial dev.", value: objective.clearingTests.wrist.radialDev },
          { label: "Ulnar dev.", value: objective.clearingTests.wrist.ulnarDev },
        ]}
      />
      <NoteBlock label="Active and passive movements" value={objective.activePassiveMovements} />
      <NoteBlock label="Isometric testing" value={objective.isometricTesting} />
      <NoteBlock label="Special tests" value={objective.specialTests} />
      <NoteBlock label="Flexibility test" value={objective.flexibility} />
      <NoteBlock label="Palpation" value={objective.palpation} />
      <NoteBlock label="Muscle testing" value={objective.muscleTesting} />
      <NoteBlock label="Neurological tests" value={objective.neurologicalTests} />
      <NoteBlock label="Additional movements" value={objective.additionalMovements} />
      <NoteBlock label="Outcome measure(s) / comparable sign(s)" value={objective.outcomeMeasures} />
    </div>
  );
}

type AssessmentViewProps = {
  assessment: {
    id: string;
    patient_id: string;
    chief_complaint: string | null;
    history: string | null;
    pain_scale: number | null;
    observations: string | null;
    plan: string | null;
    region_notes: unknown;
    subjective?: unknown;
    objective?: unknown;
    is_locked: boolean;
    created_at: string;
  };
  patientName: string;
  practitionerName: string;
  patientSnapshot?: {
    idNumber?: string | null;
    address?: string | null;
    dateOfBirth?: string | null;
    contact?: string | null;
  };
};

export function AssessmentView({
  assessment,
  patientName,
  practitionerName,
  patientSnapshot,
}: AssessmentViewProps) {
  const annotations = parseAnnotations(assessment.region_notes);
  const anterior = annotations.filter((a) => a.view === "anterior");
  const posterior = annotations.filter((a) => a.view === "posterior");
  const subjective = parseSubjective(assessment.subjective, {
    history: assessment.history,
    chiefComplaint: assessment.chief_complaint,
  });
  const objective = parseObjective(assessment.objective, {
    observations: assessment.observations,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold [overflow-wrap:anywhere]">
            Initial assessment
          </h1>
          <p className="text-sm text-muted-foreground">
            {patientName}
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline">{practitionerName}</span>
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline">
              {new Date(assessment.created_at).toLocaleString("en-ZA", {
                timeZone: "Africa/Johannesburg",
              })}
            </span>
            {assessment.is_locked ? (
              <span className="ml-0 block text-amber-700 sm:ml-2 sm:inline">Locked</span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={routes.admin.initialAssessments}>Back</Link>
          </Button>
          {!assessment.is_locked ? (
            <Button asChild variant="secondary">
              <Link href={`${routes.admin.initialAssessment(assessment.id)}?edit=1`}>Edit</Link>
            </Button>
          ) : null}
          <Button asChild>
            <Link href={routes.admin.programmes}>Create programme</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-3 rounded-2xl border border-border p-4 text-sm sm:grid-cols-2 sm:p-6">
        <NoteBlock label="Patient name" value={patientName} />
        <NoteBlock label="ID number" value={patientSnapshot?.idNumber} />
        <NoteBlock label="Address" value={patientSnapshot?.address} />
        <NoteBlock
          label="Date of birth"
          value={
            patientSnapshot?.dateOfBirth
              ? new Date(patientSnapshot.dateOfBirth).toLocaleDateString("en-ZA")
              : null
          }
        />
        <div className="sm:col-span-2">
          <NoteBlock label="Contact details" value={patientSnapshot?.contact} />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Subjective assessment</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Front
            </p>
            <BodyDiagram view="anterior" annotations={anterior} interactive={false} />
          </div>
          <div>
            <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Back
            </p>
            <BodyDiagram view="posterior" annotations={posterior} interactive={false} />
          </div>
        </div>
        {annotations.length ? (
          <ul className="space-y-3 border-t border-border pt-4">
            {annotations.map((a) => (
              <li key={annotationKey(a.regionId, a.view)} className="text-sm">
                <p className="font-medium">
                  {regionLabel(a.regionId, a.view)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({a.view === "anterior" ? "front" : "back"})
                  </span>
                  {a.pain != null ? (
                    <span className="ml-2 text-xs text-muted-foreground">Pain {a.pain}/10</span>
                  ) : null}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground [overflow-wrap:anywhere]">
                  {a.note}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No regional notes recorded.</p>
        )}
        <div className="border-t border-border pt-4">
          <SubjectiveNotes subjective={subjective} />
        </div>
        <NoteBlock
          label="Overall pain scale"
          value={assessment.pain_scale != null ? `${assessment.pain_scale} / 10` : null}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-border p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold">Objective assessment</h2>
        <ObjectiveNotes objective={objective} />
        <NoteBlock label="Plan" value={assessment.plan} />
        <div className="border-t border-border pt-4">
          <Button asChild className="w-full sm:w-auto">
            <Link href={routes.admin.patient(assessment.patient_id)}>Open patient record</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
