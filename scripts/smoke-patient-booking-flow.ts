/**
 * Smoke checks for patient booking eligibility + practice alert recipients.
 * Run: npx tsx scripts/smoke-patient-booking-flow.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  canBookFollowUpServices,
  filterBookableServices,
} from "../src/features/booking/lib/eligibility";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: services } = await admin
    .from("services")
    .select("slug, name, is_active, is_bookable_online")
    .eq("is_active", true)
    .eq("is_bookable_online", true);

  const all = services ?? [];
  const guest = filterBookableServices(all, false).map((s) => s.slug);
  const verified = filterBookableServices(all, true).map((s) => s.slug);

  console.log("Guest/new services:", guest.join(", ") || "(none)");
  console.log("Verified services:", verified.join(", ") || "(none)");

  const { data: practitioners } = await admin
    .from("practitioners")
    .select("id, title, is_active, profiles(email, full_name)")
    .eq("is_active", true);
  console.log(
    "Active practitioners:",
    (practitioners ?? [])
      .map((p) => {
        const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
        return `${profile?.full_name ?? p.title} <${profile?.email}>`;
      })
      .join(" | ") || "(none)",
  );

  const { data: consented } = await admin
    .from("patients")
    .select("email, verified_account, informed_consent_signed")
    .eq("informed_consent_signed", true)
    .limit(3);
  console.log("\nExisting consented patients:");
  for (const p of consented ?? []) {
    const ok = canBookFollowUpServices(p);
    console.log(
      `  ${p.email} verified=${p.verified_account} consent=${p.informed_consent_signed} followUps=${ok}`,
    );
  }

  const { data: fresh } = await admin
    .from("patients")
    .select("email, verified_account, informed_consent_signed")
    .eq("informed_consent_signed", false)
    .limit(3);
  console.log("\nNew / unsigned patients:");
  for (const p of fresh ?? []) {
    const ok = canBookFollowUpServices(p);
    console.log(
      `  ${p.email} verified=${p.verified_account} consent=${p.informed_consent_signed} followUps=${ok}`,
    );
  }

  const practiceEmail = (process.env.NEXT_PUBLIC_PRACTICE_EMAIL ?? "fouza.physiotherapy@gmail.com")
    .toLowerCase();
  const practitionerId = practitioners?.[0]?.id;
  if (practitionerId) {
    const { data: pr } = await admin
      .from("practitioners")
      .select("profiles(email)")
      .eq("id", practitionerId)
      .maybeSingle();
    const profile = Array.isArray(pr?.profiles) ? pr?.profiles[0] : pr?.profiles;
    const practitionerEmail = (profile?.email ?? practiceEmail).toLowerCase();
    const recipients = Array.from(new Set([practitionerEmail, practiceEmail]));
    console.log("\nPractice alert recipients:", recipients.join(", "));
  }

  const { data: adminProfile } = await admin
    .from("profiles")
    .select("email, role")
    .eq("email", "fouza.physiotherapy@gmail.com")
    .maybeSingle();
  console.log(
    "\nPractice admin:",
    adminProfile ? `${adminProfile.email} (${adminProfile.role})` : "MISSING",
  );

  if (!guest.includes("initial-consultation") || guest.includes("follow-up-consultation")) {
    throw new Error("Guest service filter incorrect");
  }
  if (!verified.includes("follow-up-consultation")) {
    throw new Error("Verified service filter missing follow-up");
  }
  if (!adminProfile || adminProfile.role !== "admin") {
    throw new Error("Practice admin not configured");
  }
  if (!(practitioners ?? []).some((p) => {
    const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
    return profile?.email === "fouza.physiotherapy@gmail.com";
  })) {
    throw new Error("Practice Gmail is not linked to active practitioner");
  }

  console.log("\nSmoke OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
