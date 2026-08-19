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
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round(parsed * 100);
}
