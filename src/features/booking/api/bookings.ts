import { createServiceClient } from "@/lib/supabase/admin";
import type { ConfirmBookingInput, HoldInput } from "@/features/booking/schemas/booking";
import { ensurePatientPortalInvite } from "@/features/auth/lib/portal-invite";
import { drainEmailOutbox } from "@/features/notifications/lib/outbox";

const HOLD_MINUTES = 10;

export async function createHold(input: HoldInput) {
  const admin = createServiceClient();
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString();

  const { data: conflicts } = await admin
    .from("appointments")
    .select("id")
    .eq("practitioner_id", input.practitionerId)
    .in("status", ["pending", "confirmed"])
    .lt("starts_at", input.endsAt)
    .gt("ends_at", input.startsAt)
    .limit(1);

  if (conflicts?.length) {
    return { error: "That slot is no longer available", holdToken: null as string | null };
  }

  const { error } = await admin.from("appointment_holds").insert({
    practitioner_id: input.practitionerId,
    service_id: input.serviceId,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    hold_token: token,
    email: input.email ?? null,
    expires_at: expiresAt,
  });

  if (error) return { error: error.message, holdToken: null as string | null };
  return { error: null, holdToken: token, expiresAt };
}

export async function confirmBooking(input: ConfirmBookingInput) {
  const admin = createServiceClient();

  const { data: hold } = await admin
    .from("appointment_holds")
    .select("*")
    .eq("hold_token", input.holdToken)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!hold) return { error: "Hold expired or not found", appointmentId: null };

  let patientId: string | null = null;
  const { data: existing } = await admin
    .from("patients")
    .select("id")
    .eq("email", input.email.toLowerCase())
    .maybeSingle();

  if (existing) {
    patientId = existing.id;
    await admin
      .from("patients")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
      })
      .eq("id", existing.id);
  } else {
    const { data: created, error: patientError } = await admin
      .from("patients")
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email.toLowerCase(),
        phone: input.phone,
      })
      .select("id")
      .single();
    if (patientError || !created) {
      return { error: patientError?.message ?? "Patient create failed", appointmentId: null };
    }
    patientId = created.id;
  }

  const { data: appointment, error } = await admin
    .from("appointments")
    .insert({
      patient_id: patientId,
      practitioner_id: hold.practitioner_id,
      service_id: hold.service_id,
      starts_at: hold.starts_at,
      ends_at: hold.ends_at,
      status: "confirmed",
      source: "online",
    })
    .select("id")
    .single();

  if (error || !appointment) {
    return { error: error?.message ?? "Booking failed", appointmentId: null };
  }

  if (!patientId) {
    return { error: "Patient missing after booking", appointmentId: null };
  }

  await admin.from("appointment_holds").delete().eq("id", hold.id);

  const invite = await ensurePatientPortalInvite({
    email: input.email,
    fullName: `${input.firstName} ${input.lastName}`.trim(),
    patientId,
  });

  const emailPayload = {
    appointmentId: appointment.id,
    patientId,
    firstName: input.firstName,
    startsAt: hold.starts_at,
    magicLink: invite.magicLink,
  };

  await admin.from("notification_outbox").insert([
    {
      channel: "email",
      template_key: "booking.confirmed",
      recipient: input.email.toLowerCase(),
      payload: emailPayload,
    },
    {
      channel: "email",
      template_key: "portal.invite",
      recipient: input.email.toLowerCase(),
      payload: emailPayload,
    },
  ]);

  // Opportunistic send when Resend is configured; cron remains the reliable drain.
  await drainEmailOutbox(10);

  await admin.from("patient_timeline_events").insert({
    patient_id: patientId,
    event_type: "appointment.booked",
    title: "Appointment booked",
    entity_type: "appointment",
    entity_id: appointment.id,
  });

  return { error: null, appointmentId: appointment.id, magicLink: invite.magicLink };
}

export async function cancelBooking(appointmentId: string, actorId?: string) {
  const admin = createServiceClient();
  const { error } = await admin
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId);
  if (error) return { error: error.message };
  if (actorId) {
    await admin.from("audit_logs").insert({
      actor_id: actorId,
      action: "appointment.cancel",
      entity_type: "appointment",
      entity_id: appointmentId,
    });
  }
  return { error: null };
}

export async function rescheduleBooking(
  input: { appointmentId: string; startsAt: string; endsAt: string },
  actorId?: string,
) {
  const admin = createServiceClient();
  const { data: appointment, error: loadError } = await admin
    .from("appointments")
    .select("id, practitioner_id, status, patient_id")
    .eq("id", input.appointmentId)
    .maybeSingle();

  if (loadError || !appointment) {
    return { error: loadError?.message ?? "Appointment not found" };
  }
  if (appointment.status === "cancelled" || appointment.status === "completed") {
    return { error: "This appointment can no longer be rescheduled" };
  }

  const { data: conflicts } = await admin
    .from("appointments")
    .select("id")
    .eq("practitioner_id", appointment.practitioner_id)
    .in("status", ["pending", "confirmed"])
    .neq("id", appointment.id)
    .lt("starts_at", input.endsAt)
    .gt("ends_at", input.startsAt)
    .limit(1);

  if (conflicts?.length) {
    return { error: "That slot is no longer available" };
  }

  const { error } = await admin
    .from("appointments")
    .update({
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      status: appointment.status === "pending" ? "confirmed" : appointment.status,
    })
    .eq("id", appointment.id);

  if (error) return { error: error.message };

  if (actorId) {
    await admin.from("audit_logs").insert({
      actor_id: actorId,
      action: "appointment.reschedule",
      entity_type: "appointment",
      entity_id: appointment.id,
    });
  }

  if (appointment.patient_id) {
    await admin.from("patient_timeline_events").insert({
      patient_id: appointment.patient_id,
      event_type: "appointment.rescheduled",
      title: "Appointment rescheduled",
      entity_type: "appointment",
      entity_id: appointment.id,
    });
  }

  return { error: null };
}
