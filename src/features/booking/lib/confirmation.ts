import { createServiceClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth/guards";

export type BookingConfirmationSummary = {
  bookingReference: string | null;
  serviceName: string;
  startsAt: string;
  patientName: string;
  patientEmail: string | null;
  consentCompleted: boolean;
  consentVersion: string | null;
  consentSignedAt: string | null;
  priceCents: number | null;
  currency: string;
};

export async function loadBookingConfirmationSummary(input: {
  token?: string;
  appointmentId?: string;
}): Promise<BookingConfirmationSummary | null> {
  const admin = createServiceClient();
  const session = await getSessionProfile();

  let query = admin
    .from("appointments")
    .select(
      "id, booking_reference, starts_at, price_cents, currency, patient_id, services(name), patients(first_name, last_name, email, profile_id, informed_consent_signed, informed_consent_version, informed_consent_signed_at)",
    );

  if (input.token) {
    query = query.eq("confirmation_token", input.token);
  } else if (input.appointmentId && session) {
    query = query.eq("id", input.appointmentId);
  } else {
    return null;
  }

  const { data } = await query.maybeSingle();
  if (!data) return null;

  const patient = Array.isArray(data.patients) ? data.patients[0] : data.patients;
  const service = Array.isArray(data.services) ? data.services[0] : data.services;

  if (input.appointmentId && session && patient?.profile_id !== session.id) {
    const { data: contact } = await admin
      .from("patient_contacts")
      .select("id")
      .eq("profile_id", session.id)
      .eq("patient_id", data.patient_id)
      .maybeSingle();
    if (!contact && session.role === "patient") {
      return null;
    }
  }

  return {
    bookingReference: data.booking_reference,
    serviceName: service?.name ?? "Physiotherapy",
    startsAt: data.starts_at,
    patientName: `${patient?.first_name ?? ""} ${patient?.last_name ?? ""}`.trim(),
    patientEmail: patient?.email ?? null,
    consentCompleted: Boolean(patient?.informed_consent_signed),
    consentVersion: patient?.informed_consent_version ?? null,
    consentSignedAt: patient?.informed_consent_signed_at ?? null,
    priceCents: data.price_cents,
    currency: data.currency ?? "ZAR",
  };
}
