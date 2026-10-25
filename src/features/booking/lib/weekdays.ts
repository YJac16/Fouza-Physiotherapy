export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Day-of-week label (0 = Sunday). Safe to call from Server and Client Components. */
export function formatDay(day: number): string {
  return WEEKDAYS[day] ?? `Day ${day}`;
}
