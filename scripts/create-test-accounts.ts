/**
 * One-off script: create patient / receptionist / practitioner test accounts.
 * Run: npx tsx scripts/create-test-accounts.ts
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ACCOUNTS = [
  {
    email: "test.patient.fouza@example.com",
    password: "TestPatient1!",
    fullName: "Test Patient",
    role: "patient" as const,
  },
  {
    email: "test.reception.fouza@example.com",
    password: "TestReception1!",
    fullName: "Test Reception",
    role: "receptionist" as const,
  },
  {
    email: "test.practitioner.fouza@example.com",
    password: "TestPractitioner1!",
    fullName: "Test Practitioner",
    role: "practitioner" as const,
  },
] as const;

async function findUserIdByEmail(email: string) {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  return data?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
}

async function ensureAccount(account: (typeof ACCOUNTS)[number]) {
  let userId = await findUserIdByEmail(account.email);

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    });
    if (error || !data.user) {
      throw new Error(`createUser ${account.email}: ${error?.message ?? "failed"}`);
    }
    userId = data.user.id;
    console.log(`Created auth user ${account.email}`);
  } else {
    const { error } = await admin.auth.admin.updateUserById(userId, {
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    });
    if (error) throw new Error(`updateUser ${account.email}: ${error.message}`);
    console.log(`Updated password for existing ${account.email}`);
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email: account.email,
    full_name: account.fullName,
    role: account.role,
  });
  if (profileError) throw new Error(`profile ${account.email}: ${profileError.message}`);

  if (account.role === "patient") {
    const { data: existing } = await admin
      .from("patients")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();
    if (!existing) {
      const { error } = await admin.from("patients").insert({
        profile_id: userId,
        first_name: "Test",
        last_name: "Patient",
        email: account.email,
        phone: "+27000000000",
      });
      if (error) throw new Error(`patient row: ${error.message}`);
      console.log("Linked patient row");
    }
  }

  if (account.role === "practitioner") {
    const { data: existing } = await admin
      .from("practitioners")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();
    if (!existing) {
      const { error } = await admin.from("practitioners").insert({
        profile_id: userId,
        title: "Physiotherapist",
        bio: "Test practitioner account",
        is_active: true,
      });
      if (error) throw new Error(`practitioner row: ${error.message}`);
      console.log("Linked practitioner row");
    }
  }

  return { email: account.email, password: account.password, role: account.role, userId };
}

async function main() {
  const results = [];
  for (const account of ACCOUNTS) {
    results.push(await ensureAccount(account));
  }
  console.log("\nTest accounts ready:");
  for (const r of results) {
    console.log(`  ${r.role.padEnd(14)} ${r.email} / ${r.password}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
