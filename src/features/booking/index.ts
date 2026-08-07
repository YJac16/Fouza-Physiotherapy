import { BookingWizard } from "@/features/booking/components/booking-wizard";
import { AppointmentActions } from "@/features/booking/components/appointment-actions";

export {
  adminCancelAppointmentAction,
  adminRescheduleAppointmentAction,
  confirmBookingAction,
  createHoldAction,
  fetchSlotsAction,
  listBookableCatalog,
} from "@/features/booking/actions/booking";
export type { BookingActionState, BookableCatalog } from "@/features/booking/actions/booking";
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
} from "@/features/booking/schemas/booking";
export type {
  ConfirmBookingInput,
  HoldInput,
  RescheduleInput,
  SlotQuery,
} from "@/features/booking/schemas/booking";
export {
  cancelBooking,
  confirmBooking,
  createHold,
  rescheduleBooking,
} from "@/features/booking/api/bookings";
export { listAvailableSlots } from "@/features/booking/api/slots";
export type { Slot } from "@/features/booking/api/slots";
export { BOOKING_TIMEZONE } from "@/features/booking/lib/timezone";

export const BOOKING_FEATURE = "booking" as const;

export { BookingWizard, AppointmentActions };
export type {
  BookablePractitioner,
  BookableService,
  BookingWizardProps,
} from "@/features/booking/components/booking-wizard";
export type { AppointmentActionsProps } from "@/features/booking/components/appointment-actions";
