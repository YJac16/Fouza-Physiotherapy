import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AssessmentForm } from "@/features/initial-assessments/components/assessment-form";
import { AssessmentView } from "@/features/initial-assessments/components/assessment-view";
import { lockInitialAssessmentAction } from "@/features/initial-assessments/actions/assessments";
import {
  parseObjective,
  parseSubjective,
  type RegionAnnotation,
} from "@/features/initial-assessments/schemas/assessment";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

async function lockAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (id) await lockInitialAssessmentAction(id);
}

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

function contactDetails(patient: {
  phone?: string | null;
  email?: string | null;
}) {
  return [patient.phone, patient.email].filter(Boolean).join(" · ") || null;
}

export default async function InitialAssessmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const { edit } = await searchParams;
  const supabase = await createClient();

  const { data: assessment } = await supabase
    .from("initial_assessments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!assessment) notFound();

  const [{ data: patient }, { data: practitioner }, { data: patients }, { data: practitioners }] =
    await Promise.all([
      supabase
        .from("patients")
        .select("first_name, last_name, id_number, postal_address, date_of_birth, email, phone")
        .eq("id", assessment.patient_id)
        .maybeSingle(),
      supabase
        .from("practitioners")
        .select("title, profiles(full_name)")
        .eq("id", assessment.practitioner_id)
        .maybeSingle(),
      supabase.from("patients").select("id, first_name, last_name").order("last_name").limit(200),
      supabase.from("practitioners").select("id, title, profiles(full_name)").eq("is_active", true),
    ]);

  const patientName = patient
    ? `${patient.first_name} ${patient.last_name}`
    : "Patient";
  const practitionerName =
    (practitioner?.profiles as { full_name?: string } | null)?.full_name ??
    practitioner?.title ??
    "Practitioner";
  const snapshot = {
    name: patientName,
    idNumber: patient?.id_number,
    address: patient?.postal_address,
    dateOfBirth: patient?.date_of_birth,
    contact: patient ? contactDetails(patient) : null,
  };

  const showEdit = !assessment.is_locked && edit === "1";

  if (!showEdit) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        {!assessment.is_locked ? (
          <div className="flex justify-end">
            <form action={lockAction}>
              <input type="hidden" name="id" value={assessment.id} />
              <Button type="submit" variant="secondary" size="sm">
                Lock assessment
              </Button>
            </form>
          </div>
        ) : null}
        <AssessmentView
          assessment={assessment}
          patientName={patientName}
          practitionerName={practitionerName}
          patientSnapshot={snapshot}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Edit assessment</h1>
          <p className="text-sm text-muted-foreground">{patientName}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={routes.admin.initialAssessment(assessment.id)}>Cancel</Link>
        </Button>
      </div>
      <AssessmentForm
        assessmentId={assessment.id}
        defaultPatientId={assessment.patient_id}
        patientSnapshot={snapshot}
        defaults={{
          painScale: assessment.pain_scale,
          plan: assessment.plan ?? "",
          practitionerId: assessment.practitioner_id,
          appointmentId: assessment.appointment_id,
          regionNotes: parseAnnotations(assessment.region_notes),
          subjective: parseSubjective(assessment.subjective, {
            history: assessment.history,
            chiefComplaint: assessment.chief_complaint,
          }),
          objective: parseObjective(assessment.objective, {
            observations: assessment.observations,
          }),
        }}
        patients={(patients ?? []).map((p) => ({
          id: p.id,
          label: `${p.first_name} ${p.last_name}`,
        }))}
        practitioners={(practitioners ?? []).map((p) => ({
          id: p.id,
          label:
            (p.profiles as { full_name?: string } | null)?.full_name ??
            p.title ??
            "Practitioner",
        }))}
      />
    </div>
  );
}
