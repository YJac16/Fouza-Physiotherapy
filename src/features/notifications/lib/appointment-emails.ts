import { createServiceClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";

type ProfileEmail = { email: string | null } | { email: string | null }[] | null;

function unwrapEmail(profile: ProfileEmail): string | null {
  if (!profile) return null;
  const row = Array.isArray(profile) ? profile[0] : profile;
  const email = row?.email?.trim();
  return email || null;
}

/** Resolve practitioner inbox; falls back to the practice email. */
export async function resolvePractitionerEmail(practitionerId: string) {
  const admin = createServiceClient();
  const { data } = await admin
    .from("practitioners")
    .select("profiles(email)")
    .eq("id", practitionerId)
    .maybeSingle();

  return unwrapEmail((data?.profiles ?? null) as ProfileEmail) ?? siteConfig.email;
}

/** Mark pending outbox emails for an appointment as cancelled (cancel / reschedule). */
export async function cancelPendingAppointmentEmails(appointmentId: string) {
  const admin = createServiceClient();
  const { data: rows } = await admin
    .from("notification_outbox")
    .select("id, payload")
    .eq("channel", "email")
    .eq("status", "pending");

  const ids = (rows ?? [])
    .filter((row) => {
      const payload = (row.payload ?? {}) as Record<string, unknown>;
      return payload.appointmentId === appointmentId;
    })
    .map((row) => row.id);

  if (!ids.length) return { cancelled: 0 };

  const { error } = await admin
    .from("notification_outbox")
    .update({ status: "cancelled" })
    .in("id", ids);

  if (error) return { cancelled: 0, error: error.message };
  return { cancelled: ids.length };
}
