/**
 * Smoke-test: sign in as each role using Supabase auth.
 * Run: npx tsx scripts/smoke-test-auth.ts
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const accounts = [
  { email: "test.patient.fouza@example.com", password: "TestPatient1!", role: "patient" },
  { email: "test.reception.fouza@example.com", password: "TestReception1!", role: "receptionist" },
];

async function main() {
  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const account of accounts) {
    const client = createClient(url, anon, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data, error } = await client.auth.signInWithPassword({
      email: account.email,
      password: account.password,
    });
    if (error || !data.user) {
      console.error(`FAIL login ${account.role}: ${error?.message}`);
      process.exitCode = 1;
      continue;
    }
    const { data: profile } = await admin
      .from("profiles")
      .select("role, email")
      .eq("id", data.user.id)
      .maybeSingle();
    const ok = profile?.role === account.role;
    console.log(
      `${ok ? "OK" : "FAIL"} ${account.role} login → profile.role=${profile?.role ?? "missing"}`,
    );
    if (!ok) process.exitCode = 1;
    await client.auth.signOut();
  }

  // Data checks for new features
  const { count: programmes } = await admin
    .from("exercise_programmes")
    .select("*", { count: "exact", head: true });
  const { count: invoices } = await admin
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .neq("status", "paid");
  console.log(`DB: programmes=${programmes ?? 0}, unpaid invoices=${invoices ?? 0}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
