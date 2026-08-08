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

/** Unique inboxes that should receive practice booking alerts. */
export async function resolvePracticeAlertRecipients(practitionerId: string) {
  const practitionerEmail = (await resolvePractitionerEmail(practitionerId)).toLowerCase();
  const practiceEmail = siteConfig.email.toLowerCase();
  return Array.from(new Set([practitionerEmail, practiceEmail].filter(Boolean)));
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

export type AppointmentEmailContext = {
  appointmentId: string;
  patientId: string | null;
  patientEmail: string | null;
  patientName: string;
  firstName: string;
  serviceName: string;
  startsAt: string;
  practitionerId: string;
};

export async function loadAppointmentEmailContext(
  appointmentId: string,
): Promise<AppointmentEmailContext | null> {
  const admin = createServiceClient();
  const { data } = await admin
    .from("appointments")
    .select(
      "id, starts_at, practitioner_id, patient_id, patients(first_name, last_name, email), services(name)",
    )
    .eq("id", appointmentId)
    .maybeSingle();

  if (!data) return null;

  const patient = Array.isArray(data.patients) ? data.patients[0] : data.patients;
  const service = Array.isArray(data.services) ? data.services[0] : data.services;
  const firstName = patient?.first_name?.trim() || "there";
  const lastName = patient?.last_name?.trim() || "";
  const patientName = `${firstName}${lastName ? ` ${lastName}` : ""}`.trim();

  return {
    appointmentId: data.id,
    patientId: data.patient_id,
    patientEmail: patient?.email?.trim()?.toLowerCase() ?? null,
    patientName,
    firstName,
    serviceName: service?.name ?? "Physiotherapy",
    startsAt: data.starts_at,
    practitionerId: data.practitioner_id,
  };
}
