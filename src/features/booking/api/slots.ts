import { createServiceClient } from "@/lib/supabase/admin";
import {
  addMinutes,
  combineDateAndTime,
  overlaps,
  sastDayBounds,
} from "@/features/booking/lib/timezone";

export type Slot = { startsAt: string; endsAt: string; label: string };

async function readBufferMinutes(admin: ReturnType<typeof createServiceClient>) {
  const { data } = await admin
    .from("practice_settings")
    .select("value")
    .eq("key", "booking.buffer_minutes")
    .maybeSingle();
  const raw = data?.value;
  const n =
    typeof raw === "number"
      ? raw
      : typeof raw === "string"
        ? Number(raw)
        : typeof raw === "object" && raw !== null && "value" in (raw as object)
          ? Number((raw as { value: unknown }).value)
          : Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/**
 * Expand busy intervals by optional practice buffer on both sides.
 * Stored appointment times are unchanged — buffer only affects free-slot generation.
 */
export function expandBusyWithBuffer(
  intervals: Array<{ start: Date; end: Date }>,
  bufferMinutes: number,
) {
  if (bufferMinutes <= 0) return intervals;
  return intervals.map((b) => ({
    start: addMinutes(b.start, -bufferMinutes),
    end: addMinutes(b.end, bufferMinutes),
  }));
}

export async function listAvailableSlots(input: {
  practitionerId: string;
  serviceId: string;
  date: string;
  /** When rescheduling, ignore this appointment's own window. */
  excludeAppointmentId?: string;
  /** When confirming a hold, ignore that hold in busy intervals. */
  excludeHoldId?: string;
}): Promise<Slot[]> {
  const admin = createServiceClient();

  const { data: service } = await admin
    .from("services")
    .select("duration_minutes")
    .eq("id", input.serviceId)
    .maybeSingle();
  const duration = service?.duration_minutes ?? 60;
  const bufferMinutes = await readBufferMinutes(admin);

  const day = new Date(`${input.date}T12:00:00+02:00`).getDay();

  const { data: rules } = await admin
    .from("availability_rules")
    .select("*")
    .eq("practitioner_id", input.practitionerId)
    .eq("day_of_week", day)
    .eq("is_active", true);

  const { data: exceptions } = await admin
    .from("availability_exceptions")
    .select("*")
    .eq("practitioner_id", input.practitionerId)
    .eq("exception_date", input.date);

  const blocking = (exceptions ?? []).find((e) => !e.is_available);
  if (blocking) return [];

  const openException = (exceptions ?? []).find(
    (e) => e.is_available && e.start_time && e.end_time,
  );

  const { startIso: dayStart, endIso: dayEnd } = sastDayBounds(input.date);

  let appointmentsQuery = admin
    .from("appointments")
    .select("id, starts_at, ends_at")
    .eq("practitioner_id", input.practitionerId)
    .gte("starts_at", dayStart)
    .lte("starts_at", dayEnd)
    .in("status", ["pending", "confirmed"]);

  if (input.excludeAppointmentId) {
    appointmentsQuery = appointmentsQuery.neq("id", input.excludeAppointmentId);
  }

  const [{ data: appointments }, { data: holds }] = await Promise.all([
    appointmentsQuery,
    (() => {
      let holdsQuery = admin
        .from("appointment_holds")
        .select("id, starts_at, ends_at")
        .eq("practitioner_id", input.practitionerId)
        .gt("expires_at", new Date().toISOString())
        .gte("starts_at", dayStart)
        .lte("starts_at", dayEnd);
      if (input.excludeHoldId) {
        holdsQuery = holdsQuery.neq("id", input.excludeHoldId);
      }
      return holdsQuery;
    })(),
  ]);

  const busy = expandBusyWithBuffer(
    [
      ...(appointments ?? []).map((a) => ({
        start: new Date(a.starts_at),
        end: new Date(a.ends_at),
      })),
      ...(holds ?? []).map((h) => ({
        start: new Date(h.starts_at),
        end: new Date(h.ends_at),
      })),
    ],
    bufferMinutes,
  );

  type Window = { startTime: string; endTime: string; slotMinutes: number };
  const windows: Window[] = openException
    ? [
        {
          startTime: String(openException.start_time).slice(0, 5),
          endTime: String(openException.end_time).slice(0, 5),
          slotMinutes: duration,
        },
      ]
    : (rules ?? []).map((rule) => ({
        startTime: rule.start_time.slice(0, 5),
        endTime: rule.end_time.slice(0, 5),
        slotMinutes: rule.slot_minutes || duration,
      }));

  const slots: Slot[] = [];
  const now = new Date();

  for (const window of windows) {
    const slotMinutes = window.slotMinutes || duration;
    let cursor = combineDateAndTime(input.date, window.startTime);
    const end = combineDateAndTime(input.date, window.endTime);

    while (addMinutes(cursor, duration) <= end) {
      const slotEnd = addMinutes(cursor, duration);
      const conflict = busy.some((b) => overlaps(cursor, slotEnd, b.start, b.end));
      if (!conflict && cursor > now) {
        const label = cursor.toLocaleTimeString("en-ZA", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Africa/Johannesburg",
        });
        slots.push({
          startsAt: cursor.toISOString(),
          endsAt: slotEnd.toISOString(),
          label,
        });
      }
      cursor = addMinutes(cursor, slotMinutes);
    }
  }

  return slots;
}

/** True when the exact window is still free under current rules (for staff create / confirm recheck). */
export async function isSlotStillAvailable(input: {
  practitionerId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
  excludeAppointmentId?: string;
  excludeHoldId?: string;
}) {
  const dateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(input.startsAt));

  const slots = await listAvailableSlots({
    practitionerId: input.practitionerId,
    serviceId: input.serviceId,
    date: dateKey,
    excludeAppointmentId: input.excludeAppointmentId,
    excludeHoldId: input.excludeHoldId,
  });

  return slots.some(
    (s) => s.startsAt === input.startsAt && s.endsAt === input.endsAt,
  );
}
