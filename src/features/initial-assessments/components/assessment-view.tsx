import Link from "next/link";

import { Button } from "@/components/ui/button";
import { BodyDiagram } from "@/features/initial-assessments/components/body-diagram";
import {
  annotationKey,
  regionLabel,
} from "@/features/initial-assessments/lib/body-regions";
import type { RegionAnnotation } from "@/features/initial-assessments/schemas/assessment";
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
    is_locked: boolean;
    created_at: string;
  };
  patientName: string;
  practitionerName: string;
};

export function AssessmentView({
  assessment,
  patientName,
  practitionerName,
}: AssessmentViewProps) {
  const annotations = parseAnnotations(assessment.region_notes);
  const anterior = annotations.filter((a) => a.view === "anterior");
  const posterior = annotations.filter((a) => a.view === "posterior");

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

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-2xl border border-border p-4 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Body map</h2>
          <div className="grid gap-6 sm:grid-cols-2">
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
        </section>

        <section className="space-y-5 rounded-2xl border border-border p-4 sm:p-6">
          <h2 className="font-display text-lg font-semibold">Assessment details</h2>
          {(
            [
              ["Chief complaint", assessment.chief_complaint],
              ["History", assessment.history],
              [
                "Overall pain scale",
                assessment.pain_scale != null ? `${assessment.pain_scale} / 10` : null,
              ],
              ["Observations", assessment.observations],
              ["Plan", assessment.plan],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm [overflow-wrap:anywhere]">
                {value || "—"}
              </p>
            </div>
          ))}

          <div className="border-t border-border pt-4">
            <Button asChild className="w-full sm:w-auto">
              <Link href={routes.admin.patient(assessment.patient_id)}>Open patient record</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
