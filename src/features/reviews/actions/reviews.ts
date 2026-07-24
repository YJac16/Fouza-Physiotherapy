"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { enqueueNotification } from "@/features/notifications";

export async function syncGoogleReviewsAction() {
  await requireStaff();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) {
    return { error: "Google Places credentials not configured", synced: 0 };
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  const json = (await res.json()) as {
    result?: {
      reviews?: Array<{
        author_name: string;
        rating: number;
        text?: string;
        time?: number;
        author_url?: string;
      }>;
    };
  };

  const reviews = json.result?.reviews ?? [];
  const admin = createServiceClient();
  let synced = 0;
  for (const review of reviews) {
    const googleId = `${review.author_name}-${review.time ?? 0}`;
    const { error } = await admin.from("google_reviews").upsert(
      {
        google_review_id: googleId,
        author_name: review.author_name,
        rating: review.rating,
        text: review.text ?? null,
        reviewed_at: review.time
          ? new Date(review.time * 1000).toISOString()
          : null,
        synced_at: new Date().toISOString(),
        is_visible: true,
      },
      { onConflict: "google_review_id" },
    );
    if (!error) synced += 1;
  }
  revalidatePath("/reviews");
  revalidatePath("/admin/reviews");
  return { synced };
}

export async function setReviewVisibility(id: string, isVisible: boolean) {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("google_reviews")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/reviews");
  return { success: true };
}

export async function requestReviewAction(patientId: string, email: string) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("review_requests").insert({ patient_id: patientId });
  await enqueueNotification({
    templateKey: "review.request",
    recipient: email,
    payload: { patientId },
  });
  return { success: true };
}

export async function listVisibleReviews() {
  const supabase = await createClient();
  return supabase
    .from("google_reviews")
    .select("*")
    .eq("is_visible", true)
    .order("reviewed_at", { ascending: false });
}
