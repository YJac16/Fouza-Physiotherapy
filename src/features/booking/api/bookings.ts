import { createServiceClient } from "@/lib/supabase/admin";
import type {
  ConfirmBookingInput,
  HoldInput,
  StaffCreateAppointmentInput,
} from "@/features/booking/schemas/booking";
import {
  canBookFollowUpServices,
  isFollowUpServiceSlug,
} from "@/features/booking/lib/eligibility";
import {
  canCancelAppointmentStatus,
  canCompleteAppointmentStatus,
  canCorrectAttendanceStatus,
  canMarkNoShowAppointmentStatus,
  canRescheduleAppointmentStatus,
  canTransitionAppointmentStatus,
  type AppointmentStatus,
} from "@/features/booking/lib/status";
import { ensurePatientPortalInvite } from "@/features/auth/lib/portal-invite";
import { resolveBookingPatient } from "@/features/booking/lib/booking-on-behalf";
import { drainEmailOutbox } from "@/features/notifications/lib/outbox";
import {
  cancelPendingAppointmentEmails,
  loadAppointmentEmailContext,
  resolvePracticeAlertRecipients,
} from "@/features/notifications/lib/appointment-emails";
import { getSessionProfile } from "@/lib/auth/guards";
import { syncPatientConsentFlagsIfComplete } from "@/features/consent-forms/lib/completion";
import { isSlotStillAvailable } from "@/features/booking/api/slots";

const DEFAULT_HOLD_MINUTES = 10;

function isConflictError(message: string | undefined) {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("overlap") ||
    lower.includes("conflict") ||
    lower.includes("exclusion") ||
    lower.includes("23p01") ||
    lower.includes("appointments_no_overlap")
  );
}

async function readHoldMinutes(admin: ReturnType<typeof createServiceClient>) {
  const { data } = await admin
    .from("practice_settings")
    .select("value")
    .eq("key", "booking.hold_minutes")
    .maybeSingle();
  const raw = data?.value;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_HOLD_MINUTES;
}

async function findAppointmentConflicts(
  admin: ReturnType<typeof createServiceClient>,
  input: {
    practitionerId: string;
    startsAt: string;
    endsAt: string;
    excludeAppointmentId?: string;
  },
) {
  let query = admin
    .from("appointments")
    .select("id")
    .eq("practitioner_id", input.practitionerId)
    .in("status", ["pending", "confirmed"])
    .lt("starts_at", input.endsAt)
    .gt("ends_at", input.startsAt)
    .limit(1);

  if (input.excludeAppointmentId) {
    query = query.neq("id", input.excludeAppointmentId);
  }

  const { data } = await query;
  return data ?? [];
}

async function findHoldConflicts(
  admin: ReturnType<typeof createServiceClient>,
  input: {
    practitionerId: string;
    startsAt: string;
    endsAt: string;
    excludeHoldId?: string;
  },
) {
  let query = admin
    .from("appointment_holds")
    .select("id")
    .eq("practitioner_id", input.practitionerId)
    .gt("expires_at", new Date().toISOString())
    .lt("starts_at", input.endsAt)
    .gt("ends_at", input.startsAt)
    .limit(1);

  if (input.excludeHoldId) {
    query = query.neq("id", input.excludeHoldId);
  }

  const { data } = await query;
  return data ?? [];
}

export async function purgeExpiredHolds() {
  const admin = createServiceClient();
  const { data, error } = await admin.rpc("purge_expired_appointment_holds");
  if (error) {
    // Fallback delete if RPC unavailable
    const { error: deleteError, count } = await admin
      .from("appointment_holds")
      .delete({ count: "exact" })
      .lte("expires_at", new Date().toISOString());
    if (deleteError) return { purged: 0, error: deleteError.message };
    return { purged: count ?? 0, error: null };
  }
  return { purged: typeof data === "number" ? data : 0, error: null };
}

export async function createHold(input: HoldInput) {
  const admin = createServiceClient();
  await purgeExpiredHolds();

  const token = crypto.randomUUID();
  const holdMinutes = await readHoldMinutes(admin);
  const expiresAt = new Date(Date.now() + holdMinutes * 60_000).toISOString();

  const appointmentConflicts = await findAppointmentConflicts(admin, {
    practitionerId: input.practitionerId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
  });
  if (appointmentConflicts.length) {
    return { error: "That slot is no longer available", holdToken: null as string | null };
  }

  const holdConflicts = await findHoldConflicts(admin, {
    practitionerId: input.practitionerId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
  });
  if (holdConflicts.length) {
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

  if (error) {
    if (isConflictError(error.message)) {
      return { error: "That slot is no longer available", holdToken: null as string | null };
    }
    return { error: error.message, holdToken: null as string | null };
  }
  return { error: null, holdToken: token, expiresAt };
}

type CreateAppointmentCoreInput = {
  patientId: string;
  practitionerId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  source: "online" | "admin" | "phone";
  status?: "pending" | "confirmed";
  notes?: string | null;
  actorId?: string;
  /** Skip slot-engine check (online confirm already held the slot; still rechecks conflicts). */
  skipSlotEngineCheck?: boolean;
  excludeAppointmentId?: string;
  /** When confirming a hold, exclude that hold from the conflict check. */
  excludeHoldId?: string;
};

/**
 * Shared appointment insert path for online confirm, staff create, and future AI.
 * Enforces conflict checks; DB exclusion is the final safety net.
 */
export async function createAppointmentFromSlot(input: CreateAppointmentCoreInput) {
  const admin = createServiceClient();

  const appointmentConflicts = await findAppointmentConflicts(admin, {
    practitionerId: input.practitionerId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    excludeAppointmentId: input.excludeAppointmentId,
  });
  if (appointmentConflicts.length) {
    return { error: "That slot is no longer available", appointmentId: null as string | null };
  }

  const holdConflicts = await findHoldConflicts(admin, {
    practitionerId: input.practitionerId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    excludeHoldId: input.excludeHoldId,
  });
  if (holdConflicts.length) {
    return { error: "That slot is no longer available", appointmentId: null as string | null };
  }

  if (!input.skipSlotEngineCheck) {
    const available = await isSlotStillAvailable({
      practitionerId: input.practitionerId,
      serviceId: input.serviceId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      excludeAppointmentId: input.excludeAppointmentId,
    });
    if (!available) {
      return { error: "That slot is no longer available", appointmentId: null as string | null };
    }
  }

  const { data: service, error: serviceError } = await admin
    .from("services")
    .select("id, price_cents, currency")
    .eq("id", input.serviceId)
    .maybeSingle();

  if (serviceError || !service) {
    return { error: "Service not found", appointmentId: null as string | null };
  }
  if (service.price_cents == null || service.price_cents < 0) {
    return { error: "Service is missing a price", appointmentId: null as string | null };
  }

  const appointmentRow = {
    patient_id: input.patientId,
    practitioner_id: input.practitionerId,
    service_id: input.serviceId,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    status: input.status ?? "confirmed",
    source: input.source,
    notes: input.notes ?? null,
    price_cents: service.price_cents,
    currency: service.currency || "ZAR",
  };

  let { data: appointment, error } = await admin
    .from("appointments")
    .insert(appointmentRow)
    .select("id")
    .single();

  if (error && /price_cents|appointments\.currency/i.test(error.message)) {
    const { price_cents: _price, currency: _currency, ...withoutPrice } = appointmentRow;
    ({ data: appointment, error } = await admin
      .from("appointments")
      .insert(withoutPrice)
      .select("id")
      .single());
  }

  if (error || !appointment) {
    if (isConflictError(error?.message)) {
      return { error: "That slot is no longer available", appointmentId: null as string | null };
    }
    return { error: error?.message ?? "Booking failed", appointmentId: null as string | null };
  }

  if (input.actorId) {
    await admin.from("audit_logs").insert({
      actor_id: input.actorId,
      action: "appointment.create",
      entity_type: "appointment",
      entity_id: appointment.id,
      meta: {
        source: input.source,
        patientId: input.patientId,
        practitionerId: input.practitionerId,
        serviceId: input.serviceId,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
      },
    });
  }

  return { error: null, appointmentId: appointment.id as string };
}

async function enqueueBookingEmails(input: {
  appointmentId: string;
  patientId: string;
  patientEmail: string | null;
  patientName: string;
  firstName: string;
  startsAt: string;
  serviceName: string;
  practitionerId: string;
  magicLink?: string | null;
  templateConfirmed?: boolean;
}) {
  const admin = createServiceClient();
  const practiceRecipients = await resolvePracticeAlertRecipients(input.practitionerId);
  const emailPayload = {
    appointmentId: input.appointmentId,
    patientId: input.patientId,
    firstName: input.firstName,
    startsAt: input.startsAt,
    magicLink: input.magicLink ?? null,
    patientName: input.patientName,
    serviceName: input.serviceName,
  };

  const rows: Array<{
    channel: "email";
    template_key: string;
    recipient: string;
    payload: typeof emailPayload;
  }> = [];

  if (input.templateConfirmed !== false && input.patientEmail) {
    rows.push({
      channel: "email",
      template_key: "booking.confirmed",
      recipient: input.patientEmail,
      payload: emailPayload,
    });
  }

  for (const recipient of practiceRecipients) {
    rows.push({
      channel: "email",
      template_key: "booking.practitioner_alert",
      recipient,
      payload: emailPayload,
    });
  }

  if (rows.length) {
    await admin.from("notification_outbox").insert(rows);
    await drainEmailOutbox(10);
  }
}

export async function confirmBooking(input: ConfirmBookingInput) {
  const admin = createServiceClient();
  await purgeExpiredHolds();

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
  let attachProfile = true;

  const { data: owned } = session
    ? await admin
        .from("patients")
        .select(
          "id, profile_id, verified_account, informed_consent_signed, first_name, last_name, email, phone",
        )
        .eq("profile_id", session.id)
        .maybeSingle()
    : { data: null };

  const { data: contactRows } = session
    ? await admin
        .from("patient_contacts")
        .select("patient_id, can_book")
        .eq("profile_id", session.id)
    : { data: [] };

  const resolved = resolveBookingPatient({
    requestedPatientId: input.patientId,
    sessionProfileId: session?.id ?? null,
    ownedPatientId: owned?.id ?? null,
    linkedContacts: (contactRows ?? []).map((row) => ({
      patientId: row.patient_id,
      canBook: Boolean(row.can_book),
    })),
  });

  if (input.patientId && resolved.error) {
    return { error: resolved.error, appointmentId: null };
  }

  let patientRow = owned;
  if (resolved.patientId) {
    attachProfile = resolved.attachProfile;
    const { data: selected } = await admin
      .from("patients")
      .select(
        "id, profile_id, verified_account, informed_consent_signed, first_name, last_name, email, phone",
      )
      .eq("id", resolved.patientId)
      .maybeSingle();
    patientRow = selected;
  } else {
    const { data: existingByEmail } = await admin
      .from("patients")
      .select(
        "id, profile_id, verified_account, informed_consent_signed, first_name, last_name, email, phone",
      )
      .eq("email", input.email.toLowerCase())
      .maybeSingle();
    patientRow = existingByEmail ?? owned;
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
    if (attachProfile) {
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
    }
  } else {
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

  // Re-validate: other appointments may have landed; own hold is still present so skip hold conflict for self
  const appointmentConflicts = await findAppointmentConflicts(admin, {
    practitionerId: hold.practitioner_id,
    startsAt: hold.starts_at,
    endsAt: hold.ends_at,
  });
  if (appointmentConflicts.length) {
    return { error: "That slot is no longer available", appointmentId: null };
  }

  if (!patientId) {
    return { error: "Patient missing after booking prep", appointmentId: null };
  }

  if (!hold.service_id) {
    return { error: "Hold is missing a service", appointmentId: null };
  }

  // Re-read hold so expired tokens cannot confirm after slow consent/patient prep
  const { data: freshHold } = await admin
    .from("appointment_holds")
    .select("id, expires_at, starts_at, ends_at, practitioner_id, service_id")
    .eq("id", hold.id)
    .eq("hold_token", input.holdToken)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!freshHold) {
    return { error: "Hold expired or not found", appointmentId: null };
  }

  const stillAvailable = await isSlotStillAvailable({
    practitionerId: freshHold.practitioner_id,
    serviceId: freshHold.service_id!,
    startsAt: freshHold.starts_at,
    endsAt: freshHold.ends_at,
    excludeHoldId: freshHold.id,
  });
  if (!stillAvailable) {
    return { error: "That slot is no longer available", appointmentId: null };
  }

  const created = await createAppointmentFromSlot({
    patientId,
    practitionerId: freshHold.practitioner_id,
    serviceId: freshHold.service_id!,
    startsAt: freshHold.starts_at,
    endsAt: freshHold.ends_at,
    source: "online",
    status: "confirmed",
    skipSlotEngineCheck: true,
    excludeHoldId: freshHold.id,
  });

  if (created.error || !created.appointmentId) {
    return { error: created.error ?? "Booking failed", appointmentId: null };
  }

  await admin.from("appointment_holds").delete().eq("id", freshHold.id);

  const patientName = attachProfile
    ? `${input.firstName} ${input.lastName}`.trim()
    : `${patientRow?.first_name ?? input.firstName} ${patientRow?.last_name ?? input.lastName}`.trim();
  const notifyEmail = attachProfile
    ? input.email.toLowerCase()
    : (session?.email ?? input.email).toLowerCase();

  let magicLink: string | null = null;
  if (attachProfile) {
    const invite = await ensurePatientPortalInvite({
      email: input.email,
      fullName: patientName,
      patientId,
    });
    magicLink = invite.magicLink;
  }

  await enqueueBookingEmails({
    appointmentId: created.appointmentId,
    patientId,
    patientEmail: notifyEmail,
    patientName,
    firstName: attachProfile ? input.firstName : (patientRow?.first_name ?? input.firstName),
    startsAt: freshHold.starts_at,
    serviceName: service.name ?? "Physiotherapy",
    practitionerId: freshHold.practitioner_id,
    magicLink,
  });

  await admin.from("patient_timeline_events").insert({
    patient_id: patientId,
    event_type: "appointment.booked",
    title: "Appointment booked",
    entity_type: "appointment",
    entity_id: created.appointmentId,
  });

  return { error: null, appointmentId: created.appointmentId, magicLink };
}

/**
 * Staff / future-channel appointment creation.
 * Does not hard-block on missing consent; callers should surface outstanding requirements in UI.
 */
export async function createStaffAppointment(
  input: StaffCreateAppointmentInput,
  actorId: string,
) {
  const admin = createServiceClient();
  await purgeExpiredHolds();

  const { data: patient } = await admin
    .from("patients")
    .select("id, first_name, last_name, email, verified_account, informed_consent_signed")
    .eq("id", input.patientId)
    .maybeSingle();
  if (!patient) return { error: "Patient not found", appointmentId: null as string | null };

  const { data: service } = await admin
    .from("services")
    .select("id, name, slug, duration_minutes, is_active")
    .eq("id", input.serviceId)
    .maybeSingle();
  if (!service || !service.is_active) {
    return { error: "Service not found or inactive", appointmentId: null as string | null };
  }

  const expectedEnd = new Date(
    new Date(input.startsAt).getTime() + (service.duration_minutes ?? 60) * 60_000,
  ).toISOString();
  if (input.endsAt !== expectedEnd) {
    // Allow exact duration match within 1s tolerance
    const delta = Math.abs(new Date(input.endsAt).getTime() - new Date(expectedEnd).getTime());
    if (delta > 1000) {
      return {
        error: "Appointment duration does not match the selected service",
        appointmentId: null as string | null,
      };
    }
  }

  const created = await createAppointmentFromSlot({
    patientId: patient.id,
    practitionerId: input.practitionerId,
    serviceId: input.serviceId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    source: input.source ?? "admin",
    status: "confirmed",
    notes: input.notes ?? null,
    actorId,
  });

  if (created.error || !created.appointmentId) {
    return { error: created.error ?? "Booking failed", appointmentId: null as string | null };
  }

  const patientName = `${patient.first_name} ${patient.last_name}`.trim();
  await enqueueBookingEmails({
    appointmentId: created.appointmentId,
    patientId: patient.id,
    patientEmail: patient.email,
    patientName,
    firstName: patient.first_name,
    startsAt: input.startsAt,
    serviceName: service.name ?? "Physiotherapy",
    practitionerId: input.practitionerId,
  });

  await admin.from("patient_timeline_events").insert({
    patient_id: patient.id,
    event_type: "appointment.booked",
    title: "Appointment booked (staff)",
    entity_type: "appointment",
    entity_id: created.appointmentId,
  });

  const outstanding = {
    needsConsent: !patient.informed_consent_signed,
    needsVerification: !patient.verified_account,
  };

  return {
    error: null,
    appointmentId: created.appointmentId,
    outstanding,
  };
}

export async function cancelBooking(appointmentId: string, actorId?: string) {
  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("appointments")
    .select("id, status")
    .eq("id", appointmentId)
    .maybeSingle();

  if (!existing) return { error: "Appointment not found" };

  const status = existing.status as AppointmentStatus;
  if (!canCancelAppointmentStatus(status)) {
    return { error: "This appointment can no longer be cancelled" };
  }

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
      meta: { previousStatus: status },
    });
  }
  return { error: null };
}

export async function updateAppointmentAttendance(
  appointmentId: string,
  nextStatus: Extract<AppointmentStatus, "completed" | "no_show" | "confirmed">,
  actorId?: string,
) {
  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("appointments")
    .select("id, status")
    .eq("id", appointmentId)
    .maybeSingle();

  if (!existing) return { error: "Appointment not found" };

  const current = existing.status as AppointmentStatus;
  if (nextStatus === "completed" && !canCompleteAppointmentStatus(current)) {
    return { error: "This appointment cannot be marked completed" };
  }
  if (nextStatus === "no_show" && !canMarkNoShowAppointmentStatus(current)) {
    return { error: "This appointment cannot be marked as a no-show" };
  }
  if (nextStatus === "confirmed" && !canCorrectAttendanceStatus(current)) {
    return { error: "This appointment cannot be returned to booked" };
  }
  if (!canTransitionAppointmentStatus(current, nextStatus)) {
    return { error: "Invalid appointment status change" };
  }

  const { error } = await admin
    .from("appointments")
    .update({ status: nextStatus })
    .eq("id", appointmentId);
  if (error) return { error: error.message };

  if (actorId) {
    await admin.from("audit_logs").insert({
      actor_id: actorId,
      action: "appointment.attendance",
      entity_type: "appointment",
      entity_id: appointmentId,
      meta: { previousStatus: current, status: nextStatus },
    });
  }

  return { error: null };
}

export async function rescheduleBooking(
  input: { appointmentId: string; startsAt: string; endsAt: string },
  actorId?: string,
) {
  const admin = createServiceClient();
  await purgeExpiredHolds();

  const { data: appointment, error: loadError } = await admin
    .from("appointments")
    .select("id, practitioner_id, service_id, status, patient_id, starts_at, ends_at")
    .eq("id", input.appointmentId)
    .maybeSingle();

  if (loadError || !appointment) {
    return { error: loadError?.message ?? "Appointment not found" };
  }

  const status = appointment.status as AppointmentStatus;
  if (!canRescheduleAppointmentStatus(status)) {
    return { error: "This appointment can no longer be rescheduled" };
  }

  if (!appointment.service_id) {
    return { error: "Appointment is missing a service and cannot be rescheduled via slots" };
  }

  const available = await isSlotStillAvailable({
    practitionerId: appointment.practitioner_id,
    serviceId: appointment.service_id,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    excludeAppointmentId: appointment.id,
  });
  if (!available) {
    return { error: "That slot is no longer available" };
  }

  const holdConflicts = await findHoldConflicts(admin, {
    practitionerId: appointment.practitioner_id,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
  });
  if (holdConflicts.length) {
    return { error: "That slot is no longer available" };
  }

  const { error } = await admin
    .from("appointments")
    .update({
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      status: status === "pending" ? "confirmed" : status,
    })
    .eq("id", appointment.id);

  if (error) {
    if (isConflictError(error.message)) {
      return { error: "That slot is no longer available" };
    }
    return { error: error.message };
  }

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
      meta: {
        previousStartsAt: appointment.starts_at,
        previousEndsAt: appointment.ends_at,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
      },
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
