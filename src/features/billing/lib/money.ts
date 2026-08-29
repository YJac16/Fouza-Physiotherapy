const zarFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatZar(cents: number) {
  return zarFormatter.format(cents / 100);
}

export function centsToRandsInput(cents: number) {
  return (cents / 100).toFixed(2);
}

export function randsToCents(value: string | number) {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return 0;
    return Math.round(value * 100);
  }
  const compact = value.trim().replace(/\s/g, "");
  if (!compact) return 0;
  const normalized =
    compact.includes(",") && !compact.includes(".")
      ? compact.replace(",", ".")
      : compact.replace(/,/g, "");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}
