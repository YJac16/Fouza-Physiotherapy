import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ClipboardList, FileText, Receipt } from "lucide-react";

import { EmptyState } from "@/components/shared/states";
import { Timeline, type TimelineItem } from "@/components/shared/timeline";
import { MedicalAidCard, PatientProfileCard } from "@/components/patient/cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPatientConsentCompletionAdmin } from "@/features/consent-forms/lib/completion";
import { getPatient, getPatientTimeline } from "@/features/patients/api/patients";
import { routes } from "@/config/routes";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: patient } = await getPatient(id);
  if (!patient) notFound();

  const [timeline, consent] = await Promise.all([
    getPatientTimeline(id),
    getPatientConsentCompletionAdmin(id),
  ]);
  const hasTimeline =
    timeline.appointments.length +
      timeline.notes.length +
      timeline.invoices.length +
      timeline.assessments.length >
    0;

  const fullName = `${patient.first_name} ${patient.last_name}`;

  const timelineEntries: Array<TimelineItem & { sortKey: string }> = [
    ...timeline.appointments.map((appt) => ({
      id: `appt-${appt.id}`,
      title: "Appointment",
      description: `Status: ${appt.status}`,
      meta: new Date(appt.starts_at).toLocaleString("en-ZA", {
        timeZone: "Africa/Johannesburg",
      }),
      icon: <Calendar className="size-4" />,
      sortKey: appt.starts_at,
    })),
    ...timeline.notes.map((note) => ({
      id: `note-${note.id}`,
      title: "Clinical note",
      description: note.subjective || "No subjective notes",
      meta: new Date(note.created_at).toLocaleString("en-ZA", {
        timeZone: "Africa/Johannesburg",
      }),
      icon: <FileText className="size-4" />,
      sortKey: note.created_at,
    })),
    ...timeline.assessments.map((assessment) => ({
      id: `assessment-${assessment.id}`,
      title: "Initial assessment",
      description:
        assessment.chief_complaint ||
        (assessment.pain_scale != null
          ? `Pain ${assessment.pain_scale}/10`
          : "Body diagram assessment"),
      meta: new Date(assessment.created_at).toLocaleString("en-ZA", {
        timeZone: "Africa/Johannesburg",
      }),
      icon: <ClipboardList className="size-4" />,
      sortKey: assessment.created_at,
      href: routes.admin.initialAssessment(assessment.id),
    })),
    ...timeline.invoices.map((invoice) => ({
      id: `invoice-${invoice.id}`,
      title: `Invoice ${invoice.invoice_number}`,
      description: `R ${(invoice.total_cents / 100).toFixed(2)} · ${invoice.status}`,
      meta: new Date(invoice.issue_date).toLocaleDateString("en-ZA"),
      icon: <Receipt className="size-4" />,
      sortKey: invoice.issue_date,
    })),
  ];

  const timelineItems: TimelineItem[] = timelineEntries
    .sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1))
    .map(({ sortKey, ...item }) => {
      void sortKey;
      return item;
    });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">{fullName}</h1>
          <p className="text-sm text-muted-foreground">Patient record</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={`${routes.admin.newInitialAssessment}?patientId=${patient.id}`}>
              New assessment
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.admin.clinicalNotes}>Clinical notes</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.admin.billing}>Billing</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.admin.documents}>Documents</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-h5">Informed consent</CardTitle>
          <Badge variant={consent.complete ? "success" : "warning"}>
            {consent.complete ? "Complete" : "Pending"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {!consent.complete && consent.missing.length ? (
            <p className="text-sm text-muted-foreground">
              Missing: {consent.missing.join(", ")}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Intake and consent signatures are on file.
            </p>
          )}
          {consent.complete ? (
            <Button asChild variant="outline" size="sm">
              <Link href={routes.admin.consentFormPatient(id)}>View signed consent</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <PatientProfileCard
          name={fullName}
          email={patient.email ?? undefined}
          phone={patient.phone ?? undefined}
          memberSince={new Date(patient.created_at).toLocaleDateString("en-ZA")}
        />
        {patient.medical_aid_name ? (
          <MedicalAidCard
            provider={patient.medical_aid_name}
            memberNumber={patient.medical_aid_number ?? undefined}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-h5">Medical aid</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No medical aid on file.
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-h5">Demographics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Date of birth</span>
            <p className="font-medium">
              {patient.date_of_birth
                ? new Date(patient.date_of_birth).toLocaleDateString("en-ZA")
                : "—"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Email</span>
            <p className="font-medium">{patient.email ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phone</span>
            <p className="font-medium">{patient.phone ?? "—"}</p>
          </div>
          {patient.notes ? (
            <div className="sm:col-span-2">
              <span className="text-muted-foreground">Notes</span>
              <p className="font-medium">{patient.notes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Timeline</h2>
        {!hasTimeline ? (
          <EmptyState
            title="No activity yet"
            description="Appointments, notes, and invoices will appear here."
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Timeline items={timelineItems} />
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
