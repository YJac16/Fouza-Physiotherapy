import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/states";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { routes } from "@/config/routes";

export default async function InitialAssessmentsAdminPage() {
  await requireStaff();
  const supabase = await createClient();
  const { data: assessments } = await supabase
    .from("initial_assessments")
    .select(
      "id, patient_id, chief_complaint, pain_scale, is_locked, created_at, patients(first_name, last_name)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Initial assessments</h1>
          <p className="text-sm text-muted-foreground">
            Mobile body-diagram assessments — review on desktop before programmes.
          </p>
        </div>
        <Button asChild>
          <Link href={routes.admin.newInitialAssessment}>New assessment</Link>
        </Button>
      </div>

      {!assessments?.length ? (
        <EmptyState
          title="No assessments yet"
          description="Create an initial assessment from a patient record or here."
        />
      ) : (
        <div className="grid gap-4">
          {assessments.map((row) => {
            const patient = row.patients as { first_name?: string; last_name?: string } | null;
            const name = patient
              ? `${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
              : "Patient";
            return (
              <Card key={row.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base [overflow-wrap:anywhere]">
                    {name}
                    <span className="font-normal text-muted-foreground">
                      {" "}
                      · {new Date(row.created_at).toLocaleString("en-ZA")}
                      {row.is_locked ? " · Locked" : ""}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground [overflow-wrap:anywhere]">
                    {row.chief_complaint || "No chief complaint"}
                    {row.pain_scale != null ? ` · Pain ${row.pain_scale}/10` : ""}
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link href={routes.admin.initialAssessment(row.id)}>Open</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
