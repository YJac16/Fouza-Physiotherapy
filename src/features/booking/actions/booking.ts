"use server";

import { revalidatePath } from "next/cache";

import {
  confirmBookingSchema,
  holdSchema,
  rescheduleSchema,
  slotQuerySchema,
  staffCreateAppointmentSchema,
} from "@/features/booking/schemas/booking";
import { listAvailableSlots } from "@/features/booking/api/slots";
import {
  cancelBooking,
  confirmBooking,
  createHold,
  createStaffAppointment,
  rescheduleBooking,
} from "@/features/booking/api/bookings";
import {
  canBookFollowUpServices,
  filterBookableServices,
  type BookingPatientContext,
} from "@/features/booking/lib/eligibility";
import { requireStaff, getSessionProfile } from "@/lib/auth/guards";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ensureMyPatientRecord } from "@/features/patients/api/patients";
import { syncPatientConsentFlagsIfComplete } from "@/features/consent-forms/lib/completion";

export type BookingActionState = {
  error?: string;
  success?: string;
  holdToken?: string;
  appointmentId?: string;
  slots?: { startsAt: string; endsAt: string; label: string }[];
  outstanding?: { needsConsent: boolean; needsVerification: boolean };
};

export async function fetchSlotsAction(input: unknown): Promise<BookingActionState> {
  const parsed = slotQuerySchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid slot query" };
  // excludeAppointmentId is only for staff reschedule — never expose on public path
  if (parsed.data.excludeAppointmentId) {
    await requireStaff();
  }
  try {
    const slots = await listAvailableSlots(parsed.data);
    return { slots };
  } catch {
    return { error: "Unable to load slots. Check Supabase configuration." };
  }
}

export async function createHoldAction(input: unknown): Promise<BookingActionState> {
  const parsed = holdSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid hold request" };
  try {
    const result = await createHold(parsed.data);
    if (result.error || !result.holdToken) return { error: result.error ?? "Hold failed" };
    return { holdToken: result.holdToken, success: "Slot held" };
  } catch {
    return { error: "Unable to hold slot" };
  }
}

export async function confirmBookingAction(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const parsed = confirmBookingSchema.safeParse({
    holdToken: formData.get("holdToken"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: "Please complete all fields" };

  try {
    const result = await confirmBooking(parsed.data);
    if (result.error || !result.appointmentId) {
      return { error: result.error ?? "Booking failed" };
    }
    return { success: "Booked", appointmentId: result.appointmentId };
  } catch {
    return { error: "Booking unavailable. Try Setmore or call the practice." };
  }
}

export async function adminCancelAppointmentAction(appointmentId: string) {
  const profile = await requireStaff();
  const result = await cancelBooking(appointmentId, profile.id);
  if (!result.error) {
    revalidatePath("/admin");
    revalidatePath("/admin/appointments");
  }
  return result;
}

export async function adminRescheduleAppointmentAction(input: unknown) {
  const profile = await requireStaff();
  const parsed = rescheduleSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid reschedule request" };
  const result = await rescheduleBooking(parsed.data, profile.id);
  if (!result.error) {
    revalidatePath("/admin");
    revalidatePath("/admin/appointments");
  }
  return result;
}

export async function adminCreateAppointmentAction(
  input: unknown,
): Promise<BookingActionState> {
  const profile = await requireStaff();
  const parsed = staffCreateAppointmentSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid appointment details" };

  const result = await createStaffAppointment(parsed.data, profile.id);
  if (result.error || !result.appointmentId) {
    return { error: result.error ?? "Could not create appointment" };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/appointments");
  return {
    success: "Appointment created",
    appointmentId: result.appointmentId,
    outstanding: result.outstanding,
  };
}

export type CalendarAppointment = {
  id: string;
  patient_id: string;
  practitioner_id: string;
  service_id: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  source: string;
  patientName: string;
  serviceName: string | null;
  durationMinutes: number | null;
};

export type CalendarBlockedDay = {
  practitionerId: string;
  exceptionDate: string;
  reason: string | null;
};

export async function listCalendarAppointmentsAction(input: {
  fromIso: string;
  toIsoExclusive: string;
  practitionerId?: string;
}): Promise<{ appointments: CalendarAppointment[]; error?: string }> {
  await requireStaff();
  const supabase = await createClient();

  let query = supabase
    .from("appointments")
    .select(
      "id, patient_id, practitioner_id, service_id, starts_at, ends_at, status, source, patients(first_name, last_name), services(name, duration_minutes)",
    )
    .gte("starts_at", input.fromIso)
    .lt("starts_at", input.toIsoExclusive)
    .order("starts_at", { ascending: true });

  if (input.practitionerId) {
    query = query.eq("practitioner_id", input.practitionerId);
  }

  const { data, error } = await query;
  if (error) return { appointments: [], error: error.message };

  const appointments: CalendarAppointment[] = (data ?? []).map((row) => {
    const patient = (Array.isArray(row.patients) ? row.patients[0] : row.patients) as
      | { first_name: string; last_name: string }
      | null
      | undefined;
    const service = (Array.isArray(row.services) ? row.services[0] : row.services) as
      | { name: string; duration_minutes: number }
      | null
      | undefined;
    return {
      id: row.id,
      patient_id: row.patient_id,
      practitioner_id: row.practitioner_id,
      service_id: row.service_id,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      status: row.status,
      source: row.source,
      patientName: patient
        ? `${patient.first_name} ${patient.last_name}`.trim()
        : "Unknown patient",
      serviceName: service?.name ?? null,
      durationMinutes: service?.duration_minutes ?? null,
    };
  });

  return { appointments };
}

export async function listCalendarBlockedDaysAction(input: {
  fromDate: string;
  toDateExclusive: string;
  practitionerId?: string;
}): Promise<{ blocked: CalendarBlockedDay[]; error?: string }> {
  await requireStaff();
  const supabase = await createClient();

  let query = supabase
    .from("availability_exceptions")
    .select("practitioner_id, exception_date, reason, is_available")
    .eq("is_available", false)
    .gte("exception_date", input.fromDate)
    .lt("exception_date", input.toDateExclusive);

  if (input.practitionerId) {
    query = query.eq("practitioner_id", input.practitionerId);
  }

  const { data, error } = await query;
  if (error) return { blocked: [], error: error.message };

  return {
    blocked: (data ?? []).map((row) => ({
      practitionerId: row.practitioner_id,
      exceptionDate: row.exception_date,
      reason: row.reason,
    })),
  };
}

export async function getAppointmentDetailAction(appointmentId: string) {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, patient_id, practitioner_id, service_id, starts_at, ends_at, status, source, notes, patients(id, first_name, last_name, email, phone, verified_account, informed_consent_signed), services(name, duration_minutes), practitioners(id, title, profiles(full_name))",
    )
    .eq("id", appointmentId)
    .maybeSingle();

  if (error || !data) return { error: error?.message ?? "Not found", appointment: null };

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, status, total_cents")
    .eq("appointment_id", appointmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { error: null, appointment: data, invoice: invoice ?? null };
}

export async function listStaffBookingCatalog() {
  await requireStaff();
  const supabase = await createClient();
  const [{ data: services }, { data: practitioners }] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, slug, description, duration_minutes, price_cents")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("practitioners")
      .select("id, title, profile_id, profiles(full_name)")
      .eq("is_active", true),
  ]);
  return { services: services ?? [], practitioners: practitioners ?? [] };
}

export type BookableCatalog = {
  services: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    duration_minutes: number;
    price_cents: number;
  }>;
  practitioners: Array<{
    id: string;
    title: string;
    profile_id: string;
    profiles: { full_name: string } | { full_name: string }[] | null;
  }>;
  patientContext: BookingPatientContext | null;
  isAuthenticated: boolean;
};

export async function listBookableCatalog(): Promise<BookableCatalog> {
  const supabase = createServiceClient();
  const [{ data: services }, { data: practitioners }] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, slug, description, duration_minutes, price_cents")
      .eq("is_active", true)
      .eq("is_bookable_online", true)
      .order("name"),
    supabase
      .from("practitioners")
      .select("id, title, profile_id, profiles(full_name)")
      .eq("is_active", true),
  ]);

  const profile = await getSessionProfile();
  let patientContext: BookingPatientContext | null = null;

  if (profile && profile.role === "patient") {
    const { data: patient } = await ensureMyPatientRecord();
    if (patient) {
      let verifiedAccount = patient.verified_account;
      let informedConsentSigned = patient.informed_consent_signed;
      if (!informedConsentSigned) {
        const synced = await syncPatientConsentFlagsIfComplete(patient.id);
        informedConsentSigned = synced.informed_consent_signed;
        verifiedAccount = synced.verified_account;
      }
      const canFollowUps = canBookFollowUpServices({
        verified_account: verifiedAccount,
        informed_consent_signed: informedConsentSigned,
      });
      patientContext = {
        patientId: patient.id,
        firstName: patient.first_name,
        lastName: patient.last_name,
        email: patient.email ?? profile.email,
        phone: patient.phone ?? profile.phone ?? "",
        verifiedAccount,
        informedConsentSigned,
        needsConsent: !informedConsentSigned,
        canBookFollowUps: canFollowUps,
      };
    }
  }

  const allServices = services ?? [];
  const filtered = filterBookableServices(
    allServices,
    Boolean(patientContext?.canBookFollowUps),
  );

  return {
    services: filtered,
    practitioners: practitioners ?? [],
    patientContext,
    isAuthenticated: Boolean(profile),
  };
}
