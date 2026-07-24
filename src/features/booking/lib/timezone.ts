/**
 * Booking timezone helpers — Africa/Johannesburg
 */

export const BOOKING_TIMEZONE = "Africa/Johannesburg";

export function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function combineDateAndTime(dateKey: string, timeHHmm: string) {
  // Interpret wall clock in SAST (UTC+2, no DST)
  return new Date(`${dateKey}T${timeHHmm}:00+02:00`);
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export function overlaps(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) {
  return startA < endB && startB < endA;
}
