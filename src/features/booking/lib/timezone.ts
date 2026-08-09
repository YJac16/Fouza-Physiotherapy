/**
 * Booking timezone helpers — Africa/Johannesburg (SAST, UTC+2, no DST).
 */

export const BOOKING_TIMEZONE = "Africa/Johannesburg";

const SAST_OFFSET = "+02:00";

/** Format a Date as YYYY-MM-DD in Africa/Johannesburg (not UTC). */
export function toDateKey(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function combineDateAndTime(dateKey: string, timeHHmm: string) {
  // Interpret wall clock in SAST (UTC+2, no DST)
  return new Date(`${dateKey}T${timeHHmm}:00${SAST_OFFSET}`);
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

/** Inclusive SAST day bounds as ISO timestamptz strings. */
export function sastDayBounds(dateKey: string) {
  return {
    startIso: `${dateKey}T00:00:00${SAST_OFFSET}`,
    endIso: `${dateKey}T23:59:59.999${SAST_OFFSET}`,
  };
}

/** Start of SAST calendar day as Date. */
export function startOfSastDay(dateKey: string) {
  return new Date(`${dateKey}T00:00:00${SAST_OFFSET}`);
}

/** Exclusive end of SAST calendar day (next midnight). */
export function endOfSastDayExclusive(dateKey: string) {
  return addMinutes(startOfSastDay(dateKey), 24 * 60);
}

/**
 * Monday–Sunday week containing dateKey (Monday start for en-ZA practice convention).
 * Returns inclusive Monday date key and exclusive next-Monday date key.
 */
export function sastWeekRange(dateKey: string) {
  const day = startOfSastDay(dateKey);
  // getDay(): 0 Sun … 6 Sat — convert to Monday-based offset
  const jsDay = new Date(`${dateKey}T12:00:00${SAST_OFFSET}`).getDay();
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = addMinutes(day, mondayOffset * 24 * 60);
  const nextMonday = addMinutes(monday, 7 * 24 * 60);
  return {
    weekStartKey: toDateKey(monday),
    weekEndExclusiveKey: toDateKey(nextMonday),
    weekStartIso: monday.toISOString(),
    weekEndExclusiveIso: nextMonday.toISOString(),
  };
}

/** Month containing dateKey: first day key + exclusive first day of next month. */
export function sastMonthRange(dateKey: string) {
  const parts = dateKey.split("-").map(Number);
  const y = parts[0] ?? 1970;
  const m = parts[1] ?? 1;
  const monthStartKey = `${y}-${String(m).padStart(2, "0")}-01`;
  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  const monthEndExclusiveKey = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
  return {
    monthStartKey,
    monthEndExclusiveKey,
    monthStartIso: startOfSastDay(monthStartKey).toISOString(),
    monthEndExclusiveIso: startOfSastDay(monthEndExclusiveKey).toISOString(),
  };
}

/** Shift a YYYY-MM-DD key by N calendar days in SAST. */
export function addSastDays(dateKey: string, days: number) {
  return toDateKey(addMinutes(startOfSastDay(dateKey), days * 24 * 60));
}

export function formatSastTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: BOOKING_TIMEZONE,
  });
}

export function formatSastDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", {
    timeZone: BOOKING_TIMEZONE,
  });
}
