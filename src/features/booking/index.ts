import { BookingWizard } from "@/features/booking/components/booking-wizard";
import { AppointmentActions } from "@/features/booking/components/appointment-actions";
import { StaffCreateAppointment } from "@/features/booking/components/staff-create-appointment";
import { PracticeCalendar } from "@/features/booking/components/calendar/practice-calendar";

export {
  adminCancelAppointmentAction,
  adminCreateAppointmentAction,
  adminRescheduleAppointmentAction,
  confirmBookingAction,
  createHoldAction,
  fetchSlotsAction,
  getAppointmentDetailAction,
  listBookableCatalog,
  listCalendarAppointmentsAction,
  listCalendarBlockedDaysAction,
  listStaffBookingCatalog,
} from "@/features/booking/actions/booking";
export type {
  BookingActionState,
  BookableCatalog,
  CalendarAppointment,
  CalendarBlockedDay,
} from "@/features/booking/actions/booking";
export type { BookingPatientContext } from "@/features/booking/lib/eligibility";
export {
  canBookFollowUpServices,
  filterBookableServices,
  NEW_PATIENT_SERVICE_SLUGS,
  VERIFIED_ONLY_SERVICE_SLUGS,
} from "@/features/booking/lib/eligibility";
export {
  confirmBookingSchema,
  holdSchema,
  rescheduleSchema,
  slotQuerySchema,
  staffCreateAppointmentSchema,
} from "@/features/booking/schemas/booking";
export type {
  ConfirmBookingInput,
  HoldInput,
  RescheduleInput,
  SlotQuery,
  StaffCreateAppointmentInput,
} from "@/features/booking/schemas/booking";
export {
  cancelBooking,
  confirmBooking,
  createHold,
  createStaffAppointment,
  purgeExpiredHolds,
  rescheduleBooking,
} from "@/features/booking/api/bookings";
export { listAvailableSlots, isSlotStillAvailable } from "@/features/booking/api/slots";
export type { Slot } from "@/features/booking/api/slots";
export {
  BOOKING_TIMEZONE,
  toDateKey,
  formatSastTime,
  formatSastDateTime,
} from "@/features/booking/lib/timezone";
export {
  canCancelAppointmentStatus,
  canRescheduleAppointmentStatus,
  canTransitionAppointmentStatus,
  ACTIVE_BOOKING_STATUSES,
} from "@/features/booking/lib/status";

export const BOOKING_FEATURE = "booking" as const;

export {
  BookingWizard,
  AppointmentActions,
  StaffCreateAppointment,
  PracticeCalendar,
};
export type {
  BookablePractitioner,
  BookableService,
  BookingWizardProps,
} from "@/features/booking/components/booking-wizard";
export type { AppointmentActionsProps } from "@/features/booking/components/appointment-actions";
