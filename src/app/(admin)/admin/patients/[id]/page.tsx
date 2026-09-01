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
import { listStaffDocuments } from "@/features/documents/actions/documents";
import { PatientClinicalRecords } from "@/features/patients/components/patient-clinical-records";
import { PatientVerificationControls } from "@/features/patients/components/patient-verification-controls";
import { DeletePatientForm } from "@/features/patients/components/delete-patient-form";
import { EditPatientForm } from "@/features/patients/components/create-patient-form";
import { getPatient, getPatientRelatedCounts, getPatientTimeline, listPatientContacts } from "@/features/patients/api/patients";
import { routes } from "@/config/routes";
import { getSessionProfile } from "@/lib/auth/guards";
import { createSignedDownloadUrl } from "@/lib/supabase/storage";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: patient } = await getPatient(id);
  if (!patient) notFound();

  const [timeline, consent, documentsResult, contactsResult, relatedCounts, profile] = await Promise.all([
    getPatientTimeline(id),
    getPatientConsentCompletionAdmin(id),
    listStaffDocuments(id),
    listPatientContacts(id),
    getPatientRelatedCounts(id),
    getSessionProfile(),
  ]);
  const accountHolder = (contactsResult.data ?? []).find((contact) => contact.is_account_holder);

  const documents = await Promise.all(
    (documentsResult.data ?? []).map(async (doc) => {
      let downloadUrl: string | null = null;
      if (doc.storage_path) {
        const path = doc.storage_path.replace(/^patient-documents\//, "");
        const { data } = await createSignedDownloadUrl("patient-documents", path, 60 * 30);
        downloadUrl = data?.signedUrl ?? null;
      }
      return {
        id: doc.id,
        title: doc.title,
        doc_type: doc.doc_type,
        created_at: doc.created_at,
        downloadUrl,
      };
    }),
  );

  const hasTimeline =
    timeline.appointments.length +
      timeline.notes.length +
      timeline.invoices.length +
      timeline.assessments.length >
    0;

  const fullName = `${patient.first_name} ${patient.last_name}`;

  const missingDetailLabels = [
    !patient.email?.trim() ? "email" : null,
    !patient.phone?.trim() ? "phone" : null,
    !patient.date_of_birth ? "date of birth" : null,
    !patient.id_number?.trim() ? "ID number" : null,
    !patient.postal_address?.trim() ? "postal address" : null,
  ].filter(Boolean) as string[];

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
      href: routes.admin.clinicalNote(note.id),
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
      href: routes.admin.invoice(invoice.id),
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
          <Button asChild size="sm" variant="secondary">
            <Link href="#patient-details">Edit details</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`${routes.admin.newInitialAssessment}?patientId=${patient.id}`}>
              New assessment
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`${routes.admin.newClinicalNote}?patientId=${patient.id}`}>
              New clinical note
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={routes.admin.newInvoice}>New invoice</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="#documents">Documents</Link>
          </Button>
        </div>
      </div>

      {missingDetailLabels.length ? (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-6">
            <div className="space-y-1">
              <p className="font-medium">Patient details incomplete</p>
              <p className="text-sm text-muted-foreground">
                Missing: {missingDetailLabels.join(", ")}. Scroll to{" "}
                <Link href="#patient-details" className="font-medium text-foreground underline-offset-4 hover:underline">
                  Patient and account details
                </Link>{" "}
                below to add contact, ID, and billing information.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="#patient-details">Add details</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-h5">Informed consent & verification</CardTitle>
          <Badge variant={consent.complete || patient.informed_consent_signed ? "success" : "warning"}>
            {consent.complete || patient.informed_consent_signed ? "Complete" : "Pending"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <PatientVerificationControls
            patientId={patient.id}
            verified={patient.verified_account}
            consentSigned={patient.informed_consent_signed || consent.complete}
            consentSignedAt={patient.informed_consent_signed_at}
            consentVersion={patient.informed_consent_version}
          />
          {!consent.complete && !patient.informed_consent_signed && consent.missing.length ? (
            <p className="text-sm text-muted-foreground">
              Missing: {consent.missing.join(", ")}
            </p>
          ) : null}
          {consent.complete || patient.informed_consent_signed ? (
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href={routes.admin.consentFormPatient(id)}>View signed consent</Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href={routes.admin.captureConsent(id)}>Capture consent at visit</Link>
            </Button>
          )}
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
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-h5">Demographics</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="#patient-details">Update</Link>
          </Button>
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
            <span className="text-muted-foreground">ID number</span>
            <p className="font-medium">{patient.id_number ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email</span>
            <p className="font-medium">{patient.email ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phone</span>
            <p className="font-medium">{patient.phone ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-foreground">Postal address</span>
            <p className="font-medium whitespace-pre-wrap">{patient.postal_address ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Medical aid</span>
            <p className="font-medium">{patient.medical_aid_name ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Medical aid number</span>
            <p className="font-medium">{patient.medical_aid_number ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Dependant code</span>
            <p className="font-medium">{patient.medical_aid_dependant_code ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-foreground">Clinical / admin notes</span>
            <p className="font-medium whitespace-pre-wrap">{patient.notes ?? "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-h5">Account holder</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">Name</span>
            <p className="font-medium">{patient.billing_name || accountHolder?.full_name || "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Relationship</span>
            <p className="font-medium">{accountHolder?.relationship ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Email (invoices)</span>
            <p className="font-medium">
              {patient.billing_email || accountHolder?.email || "—"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Phone</span>
            <p className="font-medium">
              {patient.billing_phone || accountHolder?.phone || "—"}
            </p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-foreground">Portal</span>
            <p className="font-medium">
              {accountHolder?.profile_id ? "Invited / linked" : "Not invited"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div id="patient-details" className="scroll-mt-24">
        <EditPatientForm
          values={{
          id: patient.id,
          firstName: patient.first_name,
          lastName: patient.last_name,
          email: patient.email,
          phone: patient.phone,
          dateOfBirth: patient.date_of_birth,
          idNumber: patient.id_number,
          postalAddress: patient.postal_address,
          medicalAidName: patient.medical_aid_name,
          medicalAidNumber: patient.medical_aid_number,
          medicalAidDependantCode: patient.medical_aid_dependant_code,
          notes: patient.notes,
          billingName: patient.billing_name ?? accountHolder?.full_name,
          billingEmail: patient.billing_email ?? accountHolder?.email,
          billingPhone: patient.billing_phone ?? accountHolder?.phone,
          billingAddress: patient.billing_address,
          accountHolderRelationship: accountHolder?.relationship,
        }}
        />
      </div>

      <PatientClinicalRecords
        patientId={patient.id}
        assessments={timeline.assessments}
        notes={timeline.notes}
        documents={documents}
      />

      {profile?.role === "admin" ? (
        <DeletePatientForm
          patientId={patient.id}
          fullName={fullName}
          counts={relatedCounts}
        />
      ) : null}

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Timeline</h2>
        {!hasTimeline ? (
          <EmptyState
            title="No activity yet"
            description="Appointments, notes, assessments, and invoices will appear here."
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
