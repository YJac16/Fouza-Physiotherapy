const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Turn `2025-08` or an ISO timestamp into `Aug 2025`. Other strings pass through. */
export function formatMonthYear(value?: string | null) {
  if (!value) return undefined;
  const match = /^(\d{4})-(\d{2})/.exec(value);
  if (!match) return value;
  const month = MONTHS[Number(match[2]) - 1];
  if (!month) return value;
  return `${month} ${match[1]}`;
}
