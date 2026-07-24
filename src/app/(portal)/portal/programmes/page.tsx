import { EmptyState } from "@/components/shared/states";
import { ExerciseCard } from "@/components/patient/cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listPatientProgrammes } from "@/features/exercise-programmes/actions/programmes";

export default async function PortalProgrammesPage() {
  const { data: programmes } = await listPatientProgrammes();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Programmes</h1>
        <p className="text-sm text-muted-foreground">
          Home exercise programmes assigned by your practitioner.
        </p>
      </div>

      {!programmes?.length ? (
        <EmptyState
          title="No programmes assigned"
          description="Your practitioner will assign exercises after your consultation."
        />
      ) : (
        <div className="grid gap-6">
          {programmes.map((programme) => {
            const exercises =
              (programme.programme_exercises as
                | { id: string; name: string; sets: number | null; reps: number | null }[]
                | null) ?? [];

            return (
              <Card key={programme.id}>
                <CardHeader>
                  <CardTitle className="text-h5">{programme.title}</CardTitle>
                  {programme.description ? (
                    <p className="text-sm text-muted-foreground">{programme.description}</p>
                  ) : null}
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  {exercises.length ? (
                    exercises.map((exercise) => (
                      <ExerciseCard
                        key={exercise.id}
                        name={exercise.name}
                        sets={exercise.sets?.toString()}
                        reps={exercise.reps?.toString()}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No exercises in this programme.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
