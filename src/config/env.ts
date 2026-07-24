import { z } from "zod";

/**
 * Runtime-validated environment configuration.
 * Import from `@/config/env` — never read process.env ad-hoc in features.
 */

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_PRACTICE_NAME: z.string().min(1),
  NEXT_PUBLIC_PRACTICE_EMAIL: z.string().email(),
  NEXT_PUBLIC_PRACTICE_PHONE: z.string().min(1),
  NEXT_PUBLIC_PRACTICE_ADDRESS: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_AUTH_REDIRECT_URL: z.string().url(),
  NEXT_PUBLIC_GOOGLE_REVIEW_URL: z.string().optional(),
  NEXT_PUBLIC_ENABLE_ONLINE_BOOKING: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_PATIENT_PORTAL: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_BLOG: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  NEXT_PUBLIC_ENABLE_GOOGLE_REVIEWS: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
});

const serverSchema = clientSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().optional(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM_EMAIL: z.string().min(1),
  RESEND_REPLY_TO: z.string().email().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),
  GOOGLE_PLACE_ID: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

function getClientEnv(): ClientEnv {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_PRACTICE_NAME: process.env.NEXT_PUBLIC_PRACTICE_NAME,
    NEXT_PUBLIC_PRACTICE_EMAIL: process.env.NEXT_PUBLIC_PRACTICE_EMAIL,
    NEXT_PUBLIC_PRACTICE_PHONE: process.env.NEXT_PUBLIC_PRACTICE_PHONE,
    NEXT_PUBLIC_PRACTICE_ADDRESS: process.env.NEXT_PUBLIC_PRACTICE_ADDRESS,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_AUTH_REDIRECT_URL: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL,
    NEXT_PUBLIC_GOOGLE_REVIEW_URL: process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL,
    NEXT_PUBLIC_ENABLE_ONLINE_BOOKING: process.env.NEXT_PUBLIC_ENABLE_ONLINE_BOOKING,
    NEXT_PUBLIC_ENABLE_PATIENT_PORTAL: process.env.NEXT_PUBLIC_ENABLE_PATIENT_PORTAL,
    NEXT_PUBLIC_ENABLE_BLOG: process.env.NEXT_PUBLIC_ENABLE_BLOG,
    NEXT_PUBLIC_ENABLE_GOOGLE_REVIEWS: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_REVIEWS,
  });

  if (!parsed.success) {
    console.error("Invalid client environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid client environment variables. Check .env.local");
  }

  return parsed.data;
}

function getServerEnv(): ServerEnv {
  const parsed = serverSchema.safeParse({
    ...getClientEnvRaw(),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    RESEND_REPLY_TO: process.env.RESEND_REPLY_TO,
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    GOOGLE_PLACE_ID: process.env.GOOGLE_PLACE_ID,
  });

  if (!parsed.success) {
    console.error("Invalid server environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid server environment variables. Check .env.local");
  }

  return parsed.data;
}

/** Raw process.env bag used only when composing server parse (avoids double Zod transform issues). */
function getClientEnvRaw() {
  return {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_PRACTICE_NAME: process.env.NEXT_PUBLIC_PRACTICE_NAME,
    NEXT_PUBLIC_PRACTICE_EMAIL: process.env.NEXT_PUBLIC_PRACTICE_EMAIL,
    NEXT_PUBLIC_PRACTICE_PHONE: process.env.NEXT_PUBLIC_PRACTICE_PHONE,
    NEXT_PUBLIC_PRACTICE_ADDRESS: process.env.NEXT_PUBLIC_PRACTICE_ADDRESS,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_AUTH_REDIRECT_URL: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL,
    NEXT_PUBLIC_GOOGLE_REVIEW_URL: process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL,
    NEXT_PUBLIC_ENABLE_ONLINE_BOOKING: process.env.NEXT_PUBLIC_ENABLE_ONLINE_BOOKING,
    NEXT_PUBLIC_ENABLE_PATIENT_PORTAL: process.env.NEXT_PUBLIC_ENABLE_PATIENT_PORTAL,
    NEXT_PUBLIC_ENABLE_BLOG: process.env.NEXT_PUBLIC_ENABLE_BLOG,
    NEXT_PUBLIC_ENABLE_GOOGLE_REVIEWS: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_REVIEWS,
  };
}

/**
 * Client-safe env. Safe to import in Client Components.
 * For foundation scaffolding, validation is deferred until first access
 * so the app can boot before secrets are configured.
 */
export const env = {
  get client() {
    return getClientEnv();
  },
  get server() {
    if (typeof window !== "undefined") {
      throw new Error("Server environment variables cannot be accessed on the client.");
    }
    return getServerEnv();
  },
};
