/**
 * Smoke script: verifies DB exclusion + hold trigger reject overlapping claims.
 * Safe to run against the linked Supabase project (creates then cancels a throwaway appointment).
 *
 * Usage: npx tsx scripts/smoke-booking-conflicts.ts
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env.
 */
import { createClient } from "@supabase/supabase-js";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function main() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient(url, key, { auth: { persistSession: false } });

  const { data: practitioner } = await admin
    .from("practitioners")
    .select("id")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  const { data: service } = await admin
    .from("services")
    .select("id, duration_minutes")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  const { data: patient } = await admin.from("patients").select("id").limit(1).maybeSingle();

  if (!practitioner || !service || !patient) {
    console.log("SKIP: need at least one practitioner, service, and patient");
    return;
  }

  // Use a far-future unique offset so we do not collide with real bookings
  const startsAt = new Date(Date.now() + 120 * 24 * 60 * 60_000);
  startsAt.setUTCMinutes(17, 0, 0); // odd minute to avoid normal slot grid
  const endsAt = new Date(startsAt.getTime() + (service.duration_minutes ?? 60) * 60_000);

  const payload = {
    patient_id: patient.id,
    practitioner_id: practitioner.id,
    service_id: service.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    status: "confirmed" as const,
    source: "admin" as const,
    notes: "smoke-booking-conflicts",
  };

  const first = await admin.from("appointments").insert(payload).select("id").single();
  if (first.error || !first.data) {
    throw new Error(`First insert failed: ${first.error?.message}`);
  }

  const second = await admin.from("appointments").insert(payload).select("id").single();
  const overlapRejected =
    Boolean(second.error) &&
    /overlap|exclusion|conflict|23P01|appointments_no_overlap/i.test(
      second.error?.message ?? "",
    );

  const hold = await admin.from("appointment_holds").insert({
    practitioner_id: practitioner.id,
    service_id: service.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    hold_token: crypto.randomUUID(),
    expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
  });
  const holdRejected =
    Boolean(hold.error) &&
    /conflict|overlap|23P01/i.test(hold.error?.message ?? "");

  await admin.from("appointments").update({ status: "cancelled" }).eq("id", first.data.id);

  console.log(
    JSON.stringify(
      {
        firstAppointmentId: first.data.id,
        overlapRejected,
        holdAgainstAppointmentRejected: holdRejected,
        secondError: second.error?.message ?? null,
        holdError: hold.error?.message ?? null,
        ok: overlapRejected && holdRejected,
      },
      null,
      2,
    ),
  );

  if (!overlapRejected || !holdRejected) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
