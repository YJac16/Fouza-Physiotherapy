import { EmptyState } from "@/components/shared/states";
import { ExerciseCard } from "@/components/patient/cards";
import {
  AssignProgrammeForm,
  ExerciseLibraryForm,
} from "@/features/exercise-programmes/components/programme-forms";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { resolveExerciseMediaUrl } from "@/lib/supabase/storage";

export default async function ProgrammesAdminPage() {
  await requireStaff();
  const supabase = await createClient();
  const [{ data: programmes }, { data: exercises }, { data: patients }, { data: practitioners }] =
    await Promise.all([
      supabase
        .from("exercise_programmes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30),
      supabase.from("exercises").select("*").eq("is_active", true).order("name").limit(100),
      supabase.from("patients").select("id, first_name, last_name").order("last_name").limit(200),
      supabase.from("practitioners").select("id, title, profiles(full_name)").eq("is_active", true),
    ]);

  const library = await Promise.all(
    (exercises ?? []).map(async (e) => ({
      ...e,
      resolvedMediaUrl: await resolveExerciseMediaUrl(e.media_url),
    })),
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold">Exercise programmes</h1>
        <p className="text-sm text-muted-foreground">
          Build the library, then assign injury-related exercises (with diagrams) to patients.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ExerciseLibraryForm />
        <AssignProgrammeForm
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
          exercises={library.map((e) => ({
            id: e.id,
            name: e.name,
            category: e.category,
            media_url: e.media_url,
          }))}
        />
      </div>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Active programmes</h2>
        {!programmes?.length ? (
          <EmptyState title="No programmes" description="Assign a programme from the form above." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {programmes.map((p) => (
              <ExerciseCard key={p.id} name={p.title} duration={p.status} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Exercise library</h2>
        {!library.length ? (
          <EmptyState title="Library empty" description="Add exercises to prescribe faster." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {library.map((e) => (
              <ExerciseCard
                key={e.id}
                name={e.name}
                duration={e.category ?? undefined}
                mediaUrl={e.resolvedMediaUrl}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
