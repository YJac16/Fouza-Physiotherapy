import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SoapNoteForm } from "@/features/clinical-notes/components/soap-note-form";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export default async function NewClinicalNotePage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  await requireStaff();
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: patients }, { data: practitioners }] = await Promise.all([
    supabase
      .from("patients")
      .select("id, first_name, last_name")
      .order("last_name")
      .limit(200),
    supabase.from("practitioners").select("id, title, profiles(full_name)").eq("is_active", true),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">New SOAP note</h1>
          <p className="text-sm text-muted-foreground">Clinical documentation — staff only.</p>
        </div>
        <Button asChild variant="outline">
          <Link href={routes.admin.clinicalNotes}>Back</Link>
        </Button>
      </div>
      <SoapNoteForm
        defaultPatientId={params.patientId}
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
