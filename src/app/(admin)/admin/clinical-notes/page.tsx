import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/states";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export default async function ClinicalNotesAdminPage() {
  await requireStaff();
  const supabase = await createClient();
  const { data: notes } = await supabase
    .from("clinical_notes")
    .select("id, patient_id, is_locked, created_at, subjective")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Clinical notes</h1>
          <p className="text-sm text-muted-foreground">SOAP documentation (staff only).</p>
        </div>
        <Button asChild>
          <Link href={`${routes.admin.clinicalNotes}/new`}>New note</Link>
        </Button>
      </div>

      {!notes?.length ? (
        <EmptyState
          title="No clinical notes yet"
          description="Create a SOAP note from a patient record or appointment."
        />
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Note · {new Date(note.created_at).toLocaleString("en-ZA")}
                  {note.is_locked ? " · Locked" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {note.subjective || "No subjective notes"}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href={`${routes.admin.clinicalNotes}/${note.id}`}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
