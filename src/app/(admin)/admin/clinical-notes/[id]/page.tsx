import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { SoapNoteForm } from "@/features/clinical-notes/components/soap-note-form";
import { lockClinicalNoteAction } from "@/features/clinical-notes/actions/notes";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

async function lockAction(formData: FormData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (id) await lockClinicalNoteAction(id);
}

export default async function ClinicalNoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createClient();

  const { data: note } = await supabase.from("clinical_notes").select("*").eq("id", id).maybeSingle();
  if (!note) notFound();

  const [{ data: patients }, { data: practitioners }] = await Promise.all([
    supabase.from("patients").select("id, first_name, last_name").order("last_name").limit(200),
    supabase.from("practitioners").select("id, title, profiles(full_name)").eq("is_active", true),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">SOAP note</h1>
          <p className="text-sm text-muted-foreground">
            {note.is_locked ? "Locked — read only for practitioners" : "Editable"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={routes.admin.clinicalNotes}>Back</Link>
          </Button>
          {!note.is_locked ? (
            <form action={lockAction}>
              <input type="hidden" name="id" value={note.id} />
              <Button type="submit" variant="secondary">
                Lock note
              </Button>
            </form>
          ) : null}
        </div>
      </div>

      {note.is_locked ? (
        <div className="space-y-4 rounded-2xl border border-border p-6">
          {(["subjective", "objective", "assessment", "plan"] as const).map((field) => (
            <div key={field}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {field}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{note[field] || "—"}</p>
            </div>
          ))}
        </div>
      ) : (
        <SoapNoteForm
          noteId={note.id}
          defaultPatientId={note.patient_id}
          defaults={{
            subjective: note.subjective ?? "",
            objective: note.objective ?? "",
            assessment: note.assessment ?? "",
            plan: note.plan ?? "",
            practitionerId: note.practitioner_id,
            appointmentId: note.appointment_id,
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
      )}
    </div>
  );
}
