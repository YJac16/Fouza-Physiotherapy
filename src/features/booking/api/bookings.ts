import { createServiceClient } from "@/lib/supabase/admin";
import type { ConfirmBookingInput, HoldInput } from "@/features/booking/schemas/booking";
import {
  canBookFollowUpServices,
  isFollowUpServiceSlug,
} from "@/features/booking/lib/eligibility";
import { ensurePatientPortalInvite } from "@/features/auth/lib/portal-invite";
import { drainEmailOutbox } from "@/features/notifications/lib/outbox";
import {
  cancelPendingAppointmentEmails,
  loadAppointmentEmailContext,
  resolvePracticeAlertRecipients,
} from "@/features/notifications/lib/appointment-emails";
import { getSessionProfile } from "@/lib/auth/guards";
import { syncPatientConsentFlagsIfComplete } from "@/features/consent-forms/lib/completion";

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

  const { data: service } = await admin
    .from("services")
    .select("id, name, slug")
    .eq("id", hold.service_id)
    .maybeSingle();

  if (!service) return { error: "Service not found", appointmentId: null };

  const session = await getSessionProfile();
  let patientId: string | null = null;

  const { data: existingByEmail } = await admin
    .from("patients")
    .select(
      "id, profile_id, verified_account, informed_consent_signed, first_name, last_name, email, phone",
    )
    .eq("email", input.email.toLowerCase())
    .maybeSingle();

  let patientRow = existingByEmail;

  if (session) {
    const { data: linked } = await admin
      .from("patients")
      .select(
        "id, profile_id, verified_account, informed_consent_signed, first_name, last_name, email, phone",
      )
      .eq("profile_id", session.id)
      .maybeSingle();
    if (linked) patientRow = linked;
  }

  let flags = {
    verified_account: Boolean(patientRow?.verified_account),
    informed_consent_signed: Boolean(patientRow?.informed_consent_signed),
  };

  if (patientRow && !flags.informed_consent_signed) {
    const synced = await syncPatientConsentFlagsIfComplete(patientRow.id);
    flags = {
      verified_account: synced.verified_account,
      informed_consent_signed: synced.informed_consent_signed,
    };
  }

  if (!flags.informed_consent_signed) {
    return {
      error:
        "Please complete informed consent in your patient portal before confirming this booking.",
      appointmentId: null,
    };
  }

  if (isFollowUpServiceSlug(service.slug) && !canBookFollowUpServices(flags)) {
    return {
      error:
        "Follow-up bookings are available after your account is verified and informed consent is on file. Please book an Initial Consultation or Injury Prevention Assessment.",
      appointmentId: null,
    };
  }

  if (patientRow) {
    patientId = patientRow.id;
    await admin
      .from("patients")
      .update({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        email: input.email.toLowerCase(),
        ...(session && !patientRow.profile_id ? { profile_id: session.id } : {}),
      })
      .eq("id", patientRow.id);

    if (session) {
      await admin
        .from("profiles")
        .update({
          full_name: `${input.firstName} ${input.lastName}`.trim(),
          phone: input.phone,
        })
        .eq("id", session.id);
    }
  } else {
    // Should not normally happen once consent is required (patient row exists after consent).
    const { data: created, error: patientError } = await admin
      .from("patients")
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email.toLowerCase(),
        phone: input.phone,
        profile_id: session?.id ?? null,
      })
      .select("id, verified_account, informed_consent_signed")
      .single();
    if (patientError || !created) {
      return { error: patientError?.message ?? "Patient create failed", appointmentId: null };
    }
    if (!created.informed_consent_signed) {
      return {
        error:
          "Please complete informed consent in your patient portal before confirming this booking.",
        appointmentId: null,
      };
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

  const practiceRecipients = await resolvePracticeAlertRecipients(hold.practitioner_id);
  const patientName = `${input.firstName} ${input.lastName}`.trim();
  const serviceName = service.name ?? "Physiotherapy";

  const emailPayload = {
    appointmentId: appointment.id,
    patientId,
    firstName: input.firstName,
    startsAt: hold.starts_at,
    magicLink: invite.magicLink,
    patientName,
    serviceName,
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
    ...practiceRecipients.map((recipient) => ({
      channel: "email" as const,
      template_key: "booking.practitioner_alert",
      recipient,
      payload: emailPayload,
    })),
  ]);

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
  const context = await loadAppointmentEmailContext(appointmentId);

  const { error } = await admin
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId);
  if (error) return { error: error.message };

  await cancelPendingAppointmentEmails(appointmentId);

  if (context) {
    const payload = {
      appointmentId: context.appointmentId,
      patientId: context.patientId,
      firstName: context.firstName,
      startsAt: context.startsAt,
      patientName: context.patientName,
      serviceName: context.serviceName,
    };
    const rows: Array<{
      channel: "email";
      template_key: string;
      recipient: string;
      payload: typeof payload;
    }> = [];
    if (context.patientEmail) {
      rows.push({
        channel: "email",
        template_key: "booking.cancelled.patient",
        recipient: context.patientEmail,
        payload,
      });
    }
    const practiceRecipients = await resolvePracticeAlertRecipients(context.practitionerId);
    for (const recipient of practiceRecipients) {
      rows.push({
        channel: "email",
        template_key: "booking.cancelled.practitioner",
        recipient,
        payload,
      });
    }
    if (rows.length) {
      await admin.from("notification_outbox").insert(rows);
      await drainEmailOutbox(10);
    }
  }

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

  // Drop any pending reminders so the next cron can enqueue for the new time.
  await cancelPendingAppointmentEmails(appointment.id);

  const context = await loadAppointmentEmailContext(appointment.id);
  if (context) {
    const payload = {
      appointmentId: context.appointmentId,
      patientId: context.patientId,
      firstName: context.firstName,
      startsAt: input.startsAt,
      patientName: context.patientName,
      serviceName: context.serviceName,
    };
    const rows: Array<{
      channel: "email";
      template_key: string;
      recipient: string;
      payload: typeof payload;
    }> = [];
    if (context.patientEmail) {
      rows.push({
        channel: "email",
        template_key: "booking.rescheduled.patient",
        recipient: context.patientEmail,
        payload,
      });
    }
    const practiceRecipients = await resolvePracticeAlertRecipients(context.practitionerId);
    for (const recipient of practiceRecipients) {
      rows.push({
        channel: "email",
        template_key: "booking.rescheduled.practitioner",
        recipient,
        payload,
      });
    }
    if (rows.length) {
      await admin.from("notification_outbox").insert(rows);
      await drainEmailOutbox(10);
    }
  }

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
