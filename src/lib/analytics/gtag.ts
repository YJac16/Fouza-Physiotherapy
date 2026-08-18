export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ?? "";
export const ANALYTICS_CONSENT_KEY = "fouza-analytics-consent";

export type AnalyticsConsent = "granted" | "denied";

const FORBIDDEN_PARAM_KEYS = new Set([
  "email",
  "phone",
  "name",
  "first_name",
  "last_name",
  "message",
  "notes",
  "symptoms",
  "appointment_id",
  "patient_id",
]);

export function isGaConfigured() {
  return GA_MEASUREMENT_ID.startsWith("G-");
}

export function readAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

export function writeAnalyticsConsent(value: AnalyticsConsent) {
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
}

type GtagParams = Record<string, string | number | boolean | undefined>;

export function sanitizeAnalyticsParams(params?: GtagParams) {
  if (!params) return undefined;
  const safe: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;
    if (FORBIDDEN_PARAM_KEYS.has(key.toLowerCase())) continue;
    safe[key] = value;
  }
  return safe;
}

export function trackEvent(name: string, params?: GtagParams) {
  if (typeof window === "undefined") return;
  if (!isGaConfigured()) return;
  if (readAnalyticsConsent() !== "granted") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  gtag("event", name, sanitizeAnalyticsParams(params));
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
