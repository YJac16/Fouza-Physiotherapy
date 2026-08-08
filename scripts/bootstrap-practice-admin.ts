/**
 * Bootstrap practice admin + practitioner login for fouza.physiotherapy@gmail.com.
 * Run: npx tsx scripts/bootstrap-practice-admin.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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

const PRACTICE_EMAIL = "fouza.physiotherapy@gmail.com";
const PRACTICE_PASSWORD = "Physio123!";
const PRACTICE_NAME = "Fouza Abrahams";
const LEGACY_ADMIN_EMAIL = "fouzaabrahams0404@gmail.com";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(email: string) {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  return data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
}

async function main() {
  let userId = await findUserIdByEmail(PRACTICE_EMAIL);

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: PRACTICE_EMAIL,
      password: PRACTICE_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: PRACTICE_NAME },
    });
    if (error || !data.user) {
      throw new Error(`createUser: ${error?.message ?? "failed"}`);
    }
    userId = data.user.id;
    console.log(`Created auth user ${PRACTICE_EMAIL}`);
  } else {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: PRACTICE_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: PRACTICE_NAME },
    });
    if (error) throw new Error(`updateUser: ${error.message}`);
    console.log(`Updated password for ${PRACTICE_EMAIL}`);
  }

  // Bypass role-escalation trigger via service role upsert + SQL-style updates.
  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email: PRACTICE_EMAIL,
    full_name: PRACTICE_NAME,
    role: "admin",
  });
  if (profileError) {
    // Fallback: raw SQL via rpc is unavailable; try update then insert.
    const { error: updateError } = await admin
      .from("profiles")
      .update({
        email: PRACTICE_EMAIL,
        full_name: PRACTICE_NAME,
        role: "admin",
      })
      .eq("id", userId);
    if (updateError) throw new Error(`profile: ${profileError.message}; ${updateError.message}`);
  }

  // Move the live practitioner calendar onto this account (keep a single bookable clinician).
  const { data: legacyProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", LEGACY_ADMIN_EMAIL)
    .maybeSingle();

  const { data: existingPractitioner } = await admin
    .from("practitioners")
    .select("id, profile_id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (!existingPractitioner && legacyProfile?.id) {
    const { data: legacyPractitioner } = await admin
      .from("practitioners")
      .select("id")
      .eq("profile_id", legacyProfile.id)
      .maybeSingle();

    if (legacyPractitioner) {
      const { error } = await admin
        .from("practitioners")
        .update({
          profile_id: userId,
          title: "Founder & Physiotherapist",
          is_active: true,
        })
        .eq("id", legacyPractitioner.id);
      if (error) throw new Error(`reassign practitioner: ${error.message}`);
      console.log("Reassigned Fouza practitioner calendar to practice Gmail account");
    }
  }

  if (!existingPractitioner) {
    const { data: stillMissing } = await admin
      .from("practitioners")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();
    if (!stillMissing) {
      const { error } = await admin.from("practitioners").insert({
        profile_id: userId,
        title: "Founder & Physiotherapist",
        bio: "BSc Physiotherapy (UCT). HPCSA Registered Physiotherapist.",
        specialties: ["musculoskeletal", "rehab", "injury prevention"],
        is_active: true,
      });
      if (error) throw new Error(`create practitioner: ${error.message}`);
      console.log("Created practitioner row for practice Gmail account");
    }
  } else {
    await admin
      .from("practitioners")
      .update({ is_active: true, title: "Founder & Physiotherapist" })
      .eq("id", existingPractitioner.id);
  }

  const { data: verify } = await admin
    .from("profiles")
    .select("email, full_name, role, practitioners(id, title, is_active)")
    .eq("id", userId)
    .maybeSingle();

  console.log("\nPractice admin ready:");
  console.log(`  email:    ${PRACTICE_EMAIL}`);
  console.log(`  password: ${PRACTICE_PASSWORD}`);
  console.log(`  role:     ${verify?.role}`);
  console.log(`  profile:  ${JSON.stringify(verify, null, 2)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
