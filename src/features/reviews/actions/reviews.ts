"use server";

import { revalidatePath } from "next/cache";

import {
  googleBusinessProfile,
  officialGoogleReviews,
} from "@/content/google-reviews";
import { requireStaff } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { enqueueNotification } from "@/features/notifications";

type PlacesReview = {
  author_name: string;
  rating: number;
  text?: string;
  time?: number;
  author_url?: string;
};

async function upsertOfficialCatalog(admin: ReturnType<typeof createServiceClient>) {
  let synced = 0;
  const now = new Date().toISOString();
  for (const review of officialGoogleReviews) {
    const { error } = await admin.from("google_reviews").upsert(
      {
        google_review_id: review.googleReviewId,
        author_name: review.authorName,
        rating: review.rating,
        text: review.text,
        reviewed_at: review.reviewedAt,
        is_featured: Boolean(review.featured),
        synced_at: now,
        is_visible: true,
      },
      { onConflict: "google_review_id" },
    );
    if (!error) synced += 1;
  }
  return synced;
}

async function syncFromPlacesApi(admin: ReturnType<typeof createServiceClient>) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId =
    process.env.GOOGLE_PLACE_ID ?? googleBusinessProfile.placeId;
  if (!apiKey) {
    return { placesSynced: 0, rating: null as number | null, total: null as number | null };
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total,url,name&key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  const json = (await res.json()) as {
    status?: string;
    error_message?: string;
    result?: {
      rating?: number;
      user_ratings_total?: number;
      reviews?: PlacesReview[];
    };
  };

  if (json.status && json.status !== "OK") {
    return {
      placesSynced: 0,
      rating: null as number | null,
      total: null as number | null,
      error: json.error_message ?? json.status,
    };
  }

  const reviews = json.result?.reviews ?? [];
  let placesSynced = 0;
  const now = new Date().toISOString();
  for (const review of reviews) {
    const googleId = `places-${review.author_name}-${review.time ?? 0}`;
    const { error } = await admin.from("google_reviews").upsert(
      {
        google_review_id: googleId,
        author_name: review.author_name,
        rating: review.rating,
        text: review.text ?? null,
        reviewed_at: review.time
          ? new Date(review.time * 1000).toISOString()
          : null,
        synced_at: now,
        is_visible: true,
      },
      { onConflict: "google_review_id" },
    );
    if (!error) placesSynced += 1;
  }

  return {
    placesSynced,
    rating: json.result?.rating ?? null,
    total: json.result?.user_ratings_total ?? null,
  };
}

export async function syncGoogleReviewsAction() {
  await requireStaff();
  const admin = createServiceClient();

  const catalogSynced = await upsertOfficialCatalog(admin);
  const places = await syncFromPlacesApi(admin);

  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath("/admin/reviews");

  return {
    synced: catalogSynced + places.placesSynced,
    catalogSynced,
    placesSynced: places.placesSynced,
    placesRating: places.rating,
    placesTotal: places.total,
    error: "error" in places ? places.error : undefined,
  };
}

export async function setReviewVisibility(id: string, isVisible: boolean) {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("google_reviews")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
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
