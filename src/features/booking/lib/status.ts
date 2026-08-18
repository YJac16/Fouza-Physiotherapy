/**
 * Appointment status transitions — keep enum values; reschedule is a time change.
 *
 * Valid transitions:
 *   pending   → confirmed | cancelled
 *   confirmed → cancelled | completed | no_show
 *   cancelled → (terminal)
 *   completed → confirmed (staff correction only)
 *   no_show   → confirmed (staff correction only)
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
  completed: ["confirmed"],
  no_show: ["confirmed"],
};

export function canTransitionAppointmentStatus(
  from: AppointmentStatus,
  to: AppointmentStatus,
) {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isTerminalAppointmentStatus(status: AppointmentStatus) {
  return status === "cancelled";
}

export function canRescheduleAppointmentStatus(status: AppointmentStatus) {
  return status === "pending" || status === "confirmed";
}

export function canCancelAppointmentStatus(status: AppointmentStatus) {
  return canTransitionAppointmentStatus(status, "cancelled") && status !== "cancelled";
}

export function canCompleteAppointmentStatus(status: AppointmentStatus) {
  return canTransitionAppointmentStatus(status, "completed") && status !== "completed";
}

export function canMarkNoShowAppointmentStatus(status: AppointmentStatus) {
  return canTransitionAppointmentStatus(status, "no_show") && status !== "no_show";
}

export function canCorrectAttendanceStatus(status: AppointmentStatus) {
  return status === "completed" || status === "no_show";
}

export function appointmentBookedLabel(status: AppointmentStatus | string) {
  if (status === "pending" || status === "confirmed") return "Booked";
  if (status === "no_show") return "No-show";
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  return status;
}

/** Statuses that occupy the practitioner calendar / block availability. */
export const ACTIVE_BOOKING_STATUSES: AppointmentStatus[] = ["pending", "confirmed"];
