/**
 * Appointment status transitions — keep enum values; reschedule is a time change.
 *
 * Valid transitions:
 *   pending   → confirmed | cancelled
 *   confirmed → cancelled | completed | no_show
 *   cancelled → (terminal)
 *   completed → (terminal)
 *   no_show   → (terminal)
 */

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["cancelled", "completed", "no_show"],
  cancelled: [],
  completed: [],
  no_show: [],
};

export function canTransitionAppointmentStatus(
  from: AppointmentStatus,
  to: AppointmentStatus,
) {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminalAppointmentStatus(status: AppointmentStatus) {
  return ALLOWED_TRANSITIONS[status]?.length === 0;
}

export function canRescheduleAppointmentStatus(status: AppointmentStatus) {
  return status === "pending" || status === "confirmed";
}

export function canCancelAppointmentStatus(status: AppointmentStatus) {
  return canTransitionAppointmentStatus(status, "cancelled") && status !== "cancelled";
}

/** Statuses that occupy the practitioner calendar / block availability. */
export const ACTIVE_BOOKING_STATUSES: AppointmentStatus[] = ["pending", "confirmed"];
