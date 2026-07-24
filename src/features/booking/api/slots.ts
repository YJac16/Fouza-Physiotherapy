import { createServiceClient } from "@/lib/supabase/admin";
import {
  addMinutes,
  combineDateAndTime,
  overlaps,
} from "@/features/booking/lib/timezone";

export type Slot = { startsAt: string; endsAt: string; label: string };

export async function listAvailableSlots(input: {
  practitionerId: string;
  serviceId: string;
  date: string;
}): Promise<Slot[]> {
  const admin = createServiceClient();

  const { data: service } = await admin
    .from("services")
    .select("duration_minutes")
    .eq("id", input.serviceId)
    .maybeSingle();
  const duration = service?.duration_minutes ?? 60;

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

  if (exceptions?.some((e) => !e.is_available)) return [];

  const dayStart = `${input.date}T00:00:00+02:00`;
  const dayEnd = `${input.date}T23:59:59+02:00`;

  const [{ data: appointments }, { data: holds }] = await Promise.all([
    admin
      .from("appointments")
      .select("starts_at, ends_at")
      .eq("practitioner_id", input.practitionerId)
      .gte("starts_at", dayStart)
      .lte("starts_at", dayEnd)
      .in("status", ["pending", "confirmed"]),
    admin
      .from("appointment_holds")
      .select("starts_at, ends_at")
      .eq("practitioner_id", input.practitionerId)
      .gt("expires_at", new Date().toISOString())
      .gte("starts_at", dayStart)
      .lte("starts_at", dayEnd),
  ]);

  const busy = [
    ...(appointments ?? []).map((a) => ({
      start: new Date(a.starts_at),
      end: new Date(a.ends_at),
    })),
    ...(holds ?? []).map((h) => ({
      start: new Date(h.starts_at),
      end: new Date(h.ends_at),
    })),
  ];

  const slots: Slot[] = [];
  for (const rule of rules ?? []) {
    const slotMinutes = rule.slot_minutes || duration;
    let cursor = combineDateAndTime(input.date, rule.start_time.slice(0, 5));
    const end = combineDateAndTime(input.date, rule.end_time.slice(0, 5));

    while (addMinutes(cursor, duration) <= end) {
      const slotEnd = addMinutes(cursor, duration);
      const conflict = busy.some((b) => overlaps(cursor, slotEnd, b.start, b.end));
      if (!conflict && cursor > new Date()) {
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
