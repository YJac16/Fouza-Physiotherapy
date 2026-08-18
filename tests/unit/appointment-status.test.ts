import { describe, expect, it } from "vitest";

import {
  appointmentBookedLabel,
  canCancelAppointmentStatus,
  canCompleteAppointmentStatus,
  canCorrectAttendanceStatus,
  canMarkNoShowAppointmentStatus,
  canRescheduleAppointmentStatus,
  canTransitionAppointmentStatus,
} from "@/features/booking/lib/status";

describe("appointment attendance transitions", () => {
  it("allows complete and no-show from confirmed only", () => {
    expect(canCompleteAppointmentStatus("confirmed")).toBe(true);
    expect(canMarkNoShowAppointmentStatus("confirmed")).toBe(true);
    expect(canCompleteAppointmentStatus("pending")).toBe(false);
    expect(canMarkNoShowAppointmentStatus("pending")).toBe(false);
    expect(canCompleteAppointmentStatus("completed")).toBe(false);
    expect(canMarkNoShowAppointmentStatus("no_show")).toBe(false);
  });

  it("keeps reschedule and cancel off completed and no-show", () => {
    expect(canRescheduleAppointmentStatus("confirmed")).toBe(true);
    expect(canCancelAppointmentStatus("confirmed")).toBe(true);
    expect(canRescheduleAppointmentStatus("completed")).toBe(false);
    expect(canCancelAppointmentStatus("completed")).toBe(false);
    expect(canRescheduleAppointmentStatus("no_show")).toBe(false);
    expect(canCancelAppointmentStatus("no_show")).toBe(false);
    expect(canCancelAppointmentStatus("cancelled")).toBe(false);
  });

  it("allows a staff correction back to booked", () => {
    expect(canCorrectAttendanceStatus("completed")).toBe(true);
    expect(canCorrectAttendanceStatus("no_show")).toBe(true);
    expect(canTransitionAppointmentStatus("completed", "confirmed")).toBe(true);
    expect(canTransitionAppointmentStatus("no_show", "confirmed")).toBe(true);
    expect(canCorrectAttendanceStatus("confirmed")).toBe(false);
    expect(canTransitionAppointmentStatus("cancelled", "confirmed")).toBe(false);
  });

  it("labels booked statuses without inventing a new enum value", () => {
    expect(appointmentBookedLabel("pending")).toBe("Booked");
    expect(appointmentBookedLabel("confirmed")).toBe("Booked");
    expect(appointmentBookedLabel("completed")).toBe("Completed");
    expect(appointmentBookedLabel("no_show")).toBe("No-show");
    expect(appointmentBookedLabel("cancelled")).toBe("Cancelled");
  });
});
