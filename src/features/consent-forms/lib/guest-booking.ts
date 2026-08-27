import { createServiceClient } from "@/lib/supabase/admin";

const DEFAULT_CONSENT_HOLD_MINUTES = 30;

export type ValidatedHold = {
  id: string;
  practitioner_id: string;
  service_id: string | null;
  starts_at: string;
  ends_at: string;
  email: string | null;
  expires_at: string;
};

export async function readConsentHoldMinutes(admin: ReturnType<typeof createServiceClient>) {
  const { data } = await admin
    .from("practice_settings")
    .select("value")
    .eq("key", "booking.consent_hold_minutes")
    .maybeSingle();
  const raw = data?.value;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_CONSENT_HOLD_MINUTES;
}

export async function getValidHoldByToken(holdToken: string): Promise<ValidatedHold | null> {
  const admin = createServiceClient();
  const { data } = await admin
    .from("appointment_holds")
    .select("id, practitioner_id, service_id, starts_at, ends_at, email, expires_at")
    .eq("hold_token", holdToken)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return data ?? null;
}

export async function extendHoldForConsent(holdToken: string) {
  const admin = createServiceClient();
  const minutes = await readConsentHoldMinutes(admin);
  const expiresAt = new Date(Date.now() + minutes * 60_000).toISOString();
  const { data, error } = await admin
    .from("appointment_holds")
    .update({ expires_at: expiresAt })
    .eq("hold_token", holdToken)
    .gt("expires_at", new Date().toISOString())
    .select("expires_at")
    .maybeSingle();
  if (error || !data) {
    return { error: "Hold expired or not found", expiresAt: null as string | null };
  }
  return { error: null, expiresAt: data.expires_at as string };
}

export type GuestPatientResolution =
  | { ok: true; patientId: string; created: boolean }
  | { ok: false; error: string };

/**
 * Attach guest booking details to an existing orphan patient or create a new record.
 * Refuses when the email belongs to a patient already linked to a portal account.
 */
export async function resolveGuestPatientForHold(input: {
  holdToken: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}): Promise<GuestPatientResolution> {
  const hold = await getValidHoldByToken(input.holdToken);
  if (!hold) {
    return { ok: false, error: "Your slot hold has expired. Please choose a new time." };
  }

  const normalizedEmail = input.email.trim().toLowerCase();
  if (hold.email && hold.email.toLowerCase() !== normalizedEmail) {
    return {
      ok: false,
      error: "The email on this booking does not match the held slot. Use the same email from your details step.",
    };
  }

  const admin = createServiceClient();
  const { data: existing } = await admin
    .from("patients")
    .select("id, profile_id, informed_consent_signed")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing?.profile_id) {
    return {
      ok: false,
      error: "An account already exists for this email. Please sign in to continue booking.",
    };
  }

  if (existing) {
    const { error } = await admin
      .from("patients")
      .update({
        first_name: input.firstName.trim(),
        last_name: input.lastName.trim(),
        phone: input.phone.trim(),
        email: normalizedEmail,
      })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, patientId: existing.id, created: false };
  }

  const { data: created, error: createError } = await admin
    .from("patients")
    .insert({
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email: normalizedEmail,
      phone: input.phone.trim(),
      profile_id: null,
    })
    .select("id")
    .single();

  if (createError || !created) {
    return { ok: false, error: createError?.message ?? "Could not create patient record" };
  }

  await admin
    .from("appointment_holds")
    .update({ email: normalizedEmail })
    .eq("id", hold.id);

  return { ok: true, patientId: created.id, created: true };
}

export function holdEmailMatches(hold: ValidatedHold, email: string) {
  if (!hold.email) return true;
  return hold.email.toLowerCase() === email.trim().toLowerCase();
}
