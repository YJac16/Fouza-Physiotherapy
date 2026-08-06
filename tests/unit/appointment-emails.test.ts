import { describe, expect, it } from "vitest";

import { renderEmailTemplate } from "@/features/notifications/lib/email-templates";

describe("appointment email templates", () => {
  const payload = {
    appointmentId: "appt-1",
    firstName: "Sam",
    patientName: "Sam Patient",
    serviceName: "Manual Therapy",
    startsAt: "2026-08-07T08:00:00.000Z",
    notes: "Knee follow-up",
  };

  it("renders practitioner new-booking alert", () => {
    const result = renderEmailTemplate("booking.practitioner_alert", payload);
    expect(result.subject).toContain("Sam Patient");
    expect(result.html).toContain("New appointment booked");
    expect(result.html).toContain("Manual Therapy");
    expect(result.html).toContain("Knee follow-up");
    expect(result.html).toContain("/admin/appointments");
  });

  it("renders patient reminder", () => {
    const result = renderEmailTemplate("booking.reminder.patient", payload);
    expect(result.subject).toMatch(/reminder/i);
    expect(result.html).toContain("Hi Sam");
    expect(result.html).toContain("coming up");
  });

  it("renders practitioner reminder", () => {
    const result = renderEmailTemplate("booking.reminder.practitioner", payload);
    expect(result.subject).toBe("Reminder — Sam Patient");
    expect(result.html).toContain("Upcoming appointment");
    expect(result.html).toContain("Manual Therapy");
  });
});
