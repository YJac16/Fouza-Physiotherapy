import { EmptyState } from "@/components/shared/states";
import { ExerciseCard } from "@/components/patient/cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listPatientProgrammes } from "@/features/exercise-programmes/actions/programmes";
import { getPortalView } from "@/features/patients/api/patients";
import { patientDisplayName } from "@/features/patients/lib/access";
import { resolveExerciseMediaUrl } from "@/lib/supabase/storage";

export default async function PortalProgrammesPage() {
  const { selected: patient } = await getPortalView();
  const { data: programmes } = await listPatientProgrammes(patient?.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Programmes</h1>
        <p className="text-sm text-muted-foreground">
          {patient
            ? `Home exercise programmes for ${patientDisplayName(patient)}.`
            : "Home exercise programmes assigned by your practitioner."}
        </p>
      </div>

      {!programmes?.length ? (
        <EmptyState
          title="No programmes assigned"
          description="Your practitioner will assign exercises after your consultation."
        />
      ) : (
        <div className="grid gap-6">
          {await Promise.all(
            programmes.map(async (programme) => {
              const exercises =
                (programme.programme_exercises as
                  | {
                      id: string;
                      name: string;
                      instructions: string | null;
                      sets: number | null;
                      reps: number | null;
                      hold_seconds: number | null;
                      media_url: string | null;
                      sort_order: number;
                    }[]
                  | null) ?? [];

              const sorted = [...exercises].sort((a, b) => a.sort_order - b.sort_order);
              const withMedia = await Promise.all(
                sorted.map(async (exercise) => ({
                  ...exercise,
                  resolvedMediaUrl: await resolveExerciseMediaUrl(exercise.media_url),
                })),
              );

              return (
                <Card key={programme.id}>
                  <CardHeader>
                    <CardTitle className="text-h5">{programme.title}</CardTitle>
                    {programme.description ? (
                      <p className="text-sm text-muted-foreground">{programme.description}</p>
                    ) : null}
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-2">
                    {withMedia.length ? (
                      withMedia.map((exercise) => (
                        <ExerciseCard
                          key={exercise.id}
                          name={exercise.name}
                          sets={exercise.sets?.toString()}
                          reps={exercise.reps?.toString()}
                          duration={
                            exercise.hold_seconds
                              ? `Hold ${exercise.hold_seconds}s`
                              : undefined
                          }
                          instructions={exercise.instructions}
                          mediaUrl={exercise.resolvedMediaUrl}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No exercises in this programme.
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}
