import { describe, expect, it } from "vitest";

import { expandBusyWithBuffer } from "@/features/booking/api/slots";
import {
  canCancelAppointmentStatus,
  canCompleteAppointmentStatus,
  canCorrectAttendanceStatus,
  canMarkNoShowAppointmentStatus,
  canRescheduleAppointmentStatus,
  canTransitionAppointmentStatus,
} from "@/features/booking/lib/status";
import {
  addSastDays,
  combineDateAndTime,
  overlaps,
  sastMonthRange,
  sastWeekRange,
  toDateKey,
} from "@/features/booking/lib/timezone";
import { staffCreateAppointmentSchema } from "@/features/booking/schemas/booking";

describe("appointment status transitions", () => {
  it("allows pending → confirmed/cancelled", () => {
    expect(canTransitionAppointmentStatus("pending", "confirmed")).toBe(true);
    expect(canTransitionAppointmentStatus("pending", "cancelled")).toBe(true);
    expect(canTransitionAppointmentStatus("pending", "completed")).toBe(false);
  });

  it("allows confirmed → cancelled/completed/no_show", () => {
    expect(canTransitionAppointmentStatus("confirmed", "cancelled")).toBe(true);
    expect(canTransitionAppointmentStatus("confirmed", "completed")).toBe(true);
    expect(canTransitionAppointmentStatus("confirmed", "no_show")).toBe(true);
    expect(canRescheduleAppointmentStatus("confirmed")).toBe(true);
    expect(canCancelAppointmentStatus("confirmed")).toBe(true);
  });

  it("treats cancelled/completed/no_show as terminal for reschedule", () => {
    expect(canRescheduleAppointmentStatus("cancelled")).toBe(false);
    expect(canRescheduleAppointmentStatus("completed")).toBe(false);
    expect(canCancelAppointmentStatus("cancelled")).toBe(false);
    expect(canCancelAppointmentStatus("completed")).toBe(false);
  });

  it("allows complete and no-show from confirmed only", () => {
    expect(canCompleteAppointmentStatus("confirmed")).toBe(true);
    expect(canMarkNoShowAppointmentStatus("confirmed")).toBe(true);
    expect(canCompleteAppointmentStatus("pending")).toBe(false);
    expect(canMarkNoShowAppointmentStatus("cancelled")).toBe(false);
  });

  it("allows staff correction from completed or no-show back to confirmed", () => {
    expect(canCorrectAttendanceStatus("completed")).toBe(true);
    expect(canCorrectAttendanceStatus("no_show")).toBe(true);
    expect(canTransitionAppointmentStatus("completed", "confirmed")).toBe(true);
    expect(canTransitionAppointmentStatus("no_show", "confirmed")).toBe(true);
    expect(canCorrectAttendanceStatus("confirmed")).toBe(false);
  });
});

describe("SAST timezone helpers", () => {
  it("formats date keys in Africa/Johannesburg not UTC", () => {
    const morning = new Date("2026-03-10T01:30:00.000Z");
    expect(toDateKey(morning)).toBe("2026-03-10");

    // 2026-03-09 22:30 UTC = 2026-03-10 00:30 SAST — must be the 10th, not UTC 9th
    const nearMidnightUtc = new Date("2026-03-09T22:30:00.000Z");
    expect(toDateKey(nearMidnightUtc)).toBe("2026-03-10");
  });

  it("builds Monday-start week ranges", () => {
    // 2026-08-09 is a Sunday
    const week = sastWeekRange("2026-08-09");
    expect(week.weekStartKey).toBe("2026-08-03");
    expect(week.weekEndExclusiveKey).toBe("2026-08-10");
  });

  it("builds month ranges", () => {
    const month = sastMonthRange("2026-08-09");
    expect(month.monthStartKey).toBe("2026-08-01");
    expect(month.monthEndExclusiveKey).toBe("2026-09-01");
  });

  it("adds calendar days in SAST", () => {
    expect(addSastDays("2026-08-31", 1)).toBe("2026-09-01");
  });

  it("combines date and time as SAST wall clock", () => {
    const d = combineDateAndTime("2026-08-09", "09:00");
    expect(d.toISOString()).toBe("2026-08-09T07:00:00.000Z");
  });

  it("detects overlaps", () => {
    const a0 = combineDateAndTime("2026-08-09", "09:00");
    const a1 = combineDateAndTime("2026-08-09", "10:00");
    const b0 = combineDateAndTime("2026-08-09", "09:30");
    const b1 = combineDateAndTime("2026-08-09", "10:30");
    expect(overlaps(a0, a1, b0, b1)).toBe(true);
    const c0 = combineDateAndTime("2026-08-09", "10:00");
    const c1 = combineDateAndTime("2026-08-09", "11:00");
    expect(overlaps(a0, a1, c0, c1)).toBe(false);
  });
});

describe("buffer expansion", () => {
  it("leaves intervals unchanged when buffer is 0", () => {
    const start = combineDateAndTime("2026-08-09", "09:00");
    const end = combineDateAndTime("2026-08-09", "10:00");
    const result = expandBusyWithBuffer([{ start, end }], 0);
    expect(result[0]?.start.getTime()).toBe(start.getTime());
    expect(result[0]?.end.getTime()).toBe(end.getTime());
  });

  it("expands busy intervals when buffer > 0", () => {
    const start = combineDateAndTime("2026-08-09", "09:00");
    const end = combineDateAndTime("2026-08-09", "10:00");
    const result = expandBusyWithBuffer([{ start, end }], 15);
    expect(result[0]?.start.toISOString()).toBe(
      combineDateAndTime("2026-08-09", "08:45").toISOString(),
    );
    expect(result[0]?.end.toISOString()).toBe(
      combineDateAndTime("2026-08-09", "10:15").toISOString(),
    );
  });
});

describe("staff create schema", () => {
  it("accepts valid staff booking payload", () => {
    const parsed = staffCreateAppointmentSchema.safeParse({
      patientId: "11111111-1111-4111-8111-111111111111",
      practitionerId: "22222222-2222-4222-8222-222222222222",
      serviceId: "33333333-3333-4333-8333-333333333333",
      startsAt: "2026-08-10T07:00:00.000Z",
      endsAt: "2026-08-10T08:00:00.000Z",
      source: "admin",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid service id", () => {
    const parsed = staffCreateAppointmentSchema.safeParse({
      patientId: "11111111-1111-4111-8111-111111111111",
      practitionerId: "22222222-2222-4222-8222-222222222222",
      serviceId: "not-a-uuid",
      startsAt: "2026-08-10T07:00:00.000Z",
      endsAt: "2026-08-10T08:00:00.000Z",
    });
    expect(parsed.success).toBe(false);
  });
});
