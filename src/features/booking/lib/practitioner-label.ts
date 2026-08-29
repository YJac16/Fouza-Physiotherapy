type ProfileName = { full_name: string | null } | null | undefined;

type PractitionerRef = {
  title?: string | null;
  profiles?: ProfileName | ProfileName[];
} | null;

export function nestedRecord<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function practitionerDisplayName(
  practitioner: PractitionerRef | PractitionerRef[] | undefined,
): string {
  const row = nestedRecord(practitioner);
  const profile = nestedRecord(row?.profiles);
  const name = profile?.full_name?.trim() || "Practitioner";
  return row?.title ? `${name} · ${row.title}` : name;
}

/** Postgres `time` values arrive as `HH:MM:SS` (sometimes with fractions). */
export function formatClockTime(value: string | null | undefined) {
  if (!value) return "—";
  const match = String(value).match(/^(\d{1,2}:\d{2})/);
  return match?.[1] ?? String(value);
}
