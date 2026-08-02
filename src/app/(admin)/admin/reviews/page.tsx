import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { syncGoogleReviewsAction } from "@/features/reviews";

async function syncAction() {
  "use server";
  await syncGoogleReviewsAction();
}

export default async function ReviewsAdminPage() {
  await requireStaff();
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("google_reviews")
    .select("*")
    .order("synced_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Reviews</h1>
          <p className="text-sm text-muted-foreground">Google Reviews cache and visibility.</p>
        </div>
        <form action={syncAction}>
          <Button type="submit">Sync Google Reviews</Button>
        </form>
      </div>
      {!reviews?.length ? (
        <EmptyState
          title="No reviews synced"
          description="Click Sync to load official Google Business reviews. Optional: set GOOGLE_PLACES_API_KEY to refresh Places Details (top 5)."
        />
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-border p-4">
              <p className="font-medium">
                {r.author_name} · {r.rating}/5 · {r.is_visible ? "Visible" : "Hidden"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
