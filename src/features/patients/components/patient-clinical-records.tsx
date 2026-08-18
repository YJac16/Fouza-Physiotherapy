import Link from "next/link";

import { DocumentCard } from "@/components/patient/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/routes";

type AssessmentRow = {
  id: string;
  created_at: string;
  chief_complaint: string | null;
  pain_scale: number | null;
  is_locked: boolean;
};

type NoteRow = {
  id: string;
  created_at: string;
  subjective: string | null;
  is_locked: boolean;
};

type DocumentRow = {
  id: string;
  title: string;
  doc_type: string | null;
  created_at: string;
  downloadUrl: string | null;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-ZA");
}

export function PatientClinicalRecords({
  patientId,
  assessments,
  notes,
  documents,
}: {
  patientId: string;
  assessments: AssessmentRow[];
  notes: NoteRow[];
  documents: DocumentRow[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold">Clinical records</h2>
        <p className="text-sm text-muted-foreground">
          Staff-only assessments and notes. Patients cannot see these in the portal.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-h5">Initial assessments</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`${routes.admin.newInitialAssessment}?patientId=${patientId}`}>
                New
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {!assessments.length ? (
              <p className="text-sm text-muted-foreground">No assessments yet.</p>
            ) : (
              assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={routes.admin.initialAssessment(assessment.id)}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {assessment.chief_complaint ||
                          (assessment.pain_scale != null
                            ? `Pain ${assessment.pain_scale}/10`
                            : "Body diagram assessment")}
                      </Link>
                      {assessment.is_locked ? (
                        <Badge variant="secondary">Locked</Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(assessment.created_at)}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={routes.admin.initialAssessment(assessment.id)}>Open</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-h5">Clinical notes</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`${routes.admin.newClinicalNote}?patientId=${patientId}`}>
                New
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {!notes.length ? (
              <p className="text-sm text-muted-foreground">No clinical notes yet.</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={routes.admin.clinicalNote(note.id)}
                        className="text-sm font-medium underline-offset-4 hover:underline"
                      >
                        SOAP note
                      </Link>
                      {note.is_locked ? <Badge variant="secondary">Locked</Badge> : null}
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {note.subjective || "No subjective notes"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(note.created_at)}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="ghost">
                    <Link href={routes.admin.clinicalNote(note.id)}>Open</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card id="documents">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-h5">Documents</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={routes.admin.documents}>Register</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {!documents.length ? (
              <p className="text-sm text-muted-foreground">No documents registered.</p>
            ) : (
              documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  title={doc.title}
                  type={doc.doc_type ?? undefined}
                  date={formatDate(doc.created_at)}
                  actions={
                    doc.downloadUrl ? (
                      <Button asChild size="sm" variant="outline">
                        <a href={doc.downloadUrl} target="_blank" rel="noreferrer">
                          Open / download
                        </a>
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground">No file linked yet</p>
                    )
                  }
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
