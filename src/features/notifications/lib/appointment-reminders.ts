import { createServiceClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";
import { drainEmailOutbox } from "@/features/notifications/lib/outbox";
import type { Json } from "@/types/database";

const PATIENT_REMINDER = "booking.reminder.patient";
const PRACTITIONER_REMINDER = "booking.reminder.practitioner";

type ProfileJoin = { email: string | null; full_name: string | null } | null;
type PatientJoin = {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
} | null;
type ServiceJoin = { name: string | null } | null;
type PractitionerJoin = { profiles: ProfileJoin | ProfileJoin[] | null } | null;

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function patientDisplayName(patient: PatientJoin) {
  if (!patient) return "a patient";
  const name = [patient.first_name, patient.last_name].filter(Boolean).join(" ").trim();
  return name || "a patient";
}

/**
 * Find upcoming appointments (next ~36h) and enqueue patient + practitioner
 * reminder emails once per appointment (deduped via existing outbox rows).
 */
export async function enqueueAppointmentReminders() {
  const admin = createServiceClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 36 * 60 * 60 * 1000);

  const { data: appointments, error } = await admin
    .from("appointments")
    .select(
      `
      id,
      starts_at,
      notes,
      patients ( email, first_name, last_name ),
      services ( name ),
      practitioners ( profiles ( email, full_name ) )
    `,
    )
    .in("status", ["pending", "confirmed"])
    .gte("starts_at", now.toISOString())
    .lte("starts_at", windowEnd.toISOString())
    .order("starts_at", { ascending: true });

  if (error) {
    return { enqueued: 0, processed: 0, error: error.message };
  }

  const { data: existing } = await admin
    .from("notification_outbox")
    .select("template_key, payload, status")
    .eq("channel", "email")
    .in("template_key", [PATIENT_REMINDER, PRACTITIONER_REMINDER])
    .in("status", ["pending", "sent"]);

  const alreadySent = new Set(
    (existing ?? [])
      .map((row) => {
        const payload = (row.payload ?? {}) as Record<string, unknown>;
        const appointmentId =
          typeof payload.appointmentId === "string" ? payload.appointmentId : null;
        if (!appointmentId) return null;
        return `${row.template_key}:${appointmentId}`;
      })
      .filter((key): key is string => Boolean(key)),
  );

  const inserts: {
    channel: "email";
    template_key: string;
    recipient: string;
    payload: Record<string, unknown>;
  }[] = [];

  for (const appointment of appointments ?? []) {
    const patient = unwrapOne(appointment.patients as PatientJoin | PatientJoin[]);
    const service = unwrapOne(appointment.services as ServiceJoin | ServiceJoin[]);
    const practitioner = unwrapOne(
      appointment.practitioners as PractitionerJoin | PractitionerJoin[],
    );
    const profile = unwrapOne(practitioner?.profiles ?? null);

    const patientEmail = patient?.email?.trim().toLowerCase() || null;
    const practitionerEmail = profile?.email?.trim() || siteConfig.email;
    const patientName = patientDisplayName(patient);
    const serviceName = service?.name?.trim() || "Physiotherapy";
    const firstName = patient?.first_name?.trim() || "there";

    const basePayload = {
      appointmentId: appointment.id,
      startsAt: appointment.starts_at,
      patientName,
      serviceName,
      firstName,
      notes: appointment.notes,
    };

    if (patientEmail && !alreadySent.has(`${PATIENT_REMINDER}:${appointment.id}`)) {
      inserts.push({
        channel: "email",
        template_key: PATIENT_REMINDER,
        recipient: patientEmail,
        payload: basePayload,
      });
      alreadySent.add(`${PATIENT_REMINDER}:${appointment.id}`);
    }

    if (
      practitionerEmail.includes("@") &&
      !alreadySent.has(`${PRACTITIONER_REMINDER}:${appointment.id}`)
    ) {
      inserts.push({
        channel: "email",
        template_key: PRACTITIONER_REMINDER,
        recipient: practitionerEmail.toLowerCase(),
        payload: basePayload,
      });
      alreadySent.add(`${PRACTITIONER_REMINDER}:${appointment.id}`);
    }
  }

  if (inserts.length) {
    const { error: insertError } = await admin.from("notification_outbox").insert(
      inserts.map((row) => ({
        ...row,
        payload: row.payload as Json,
      })),
    );
    if (insertError) {
      return { enqueued: 0, processed: 0, error: insertError.message };
    }
  }

  const drain = await drainEmailOutbox(Math.max(25, inserts.length));
  return {
    enqueued: inserts.length,
    processed: drain.processed,
    skipped: drain.skipped,
    candidates: appointments?.length ?? 0,
  };
}
