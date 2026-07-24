import { BookingWizard } from "@/features/booking/components/booking-wizard";

export {
  adminCancelAppointmentAction,
  confirmBookingAction,
  createHoldAction,
  fetchSlotsAction,
  listBookableCatalog,
} from "@/features/booking/actions/booking";
export type { BookingActionState } from "@/features/booking/actions/booking";
export {
  confirmBookingSchema,
  holdSchema,
  slotQuerySchema,
} from "@/features/booking/schemas/booking";
export type {
  ConfirmBookingInput,
  HoldInput,
  SlotQuery,
} from "@/features/booking/schemas/booking";
export { cancelBooking, confirmBooking, createHold } from "@/features/booking/api/bookings";
export { listAvailableSlots } from "@/features/booking/api/slots";
export type { Slot } from "@/features/booking/api/slots";
export { BOOKING_TIMEZONE } from "@/features/booking/lib/timezone";

export const BOOKING_FEATURE = "booking" as const;

export { BookingWizard };
export type {
  BookablePractitioner,
  BookableService,
  BookingWizardProps,
} from "@/features/booking/components/booking-wizard";
