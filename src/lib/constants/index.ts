export const APP_NAME = "Fouza Physiotherapy";

export const ROLES = ["admin", "practitioner", "receptionist", "patient"] as const;

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
] as const;

export const DEFAULT_CURRENCY = "ZAR";
export const DEFAULT_TIMEZONE = "Africa/Johannesburg";
