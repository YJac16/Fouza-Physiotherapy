import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  applyRememberMeCookieOptions,
  rememberMeFromCookieValue,
  AUTH_REMEMBER_COOKIE,
} from "@/lib/supabase/auth-cookies";

function resolveRememberMe(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  rememberMe?: boolean,
) {
  if (rememberMe !== undefined) return rememberMe;
  return rememberMeFromCookieValue(cookieStore.get(AUTH_REMEMBER_COOKIE)?.value);
}

/**
 * Server Supabase client (anon key + cookie session).
 * Use in Server Components, Route Handlers, and Server Actions.
 */
export async function createClient(options?: { rememberMe?: boolean }) {
  const cookieStore = await cookies();
  const rememberMe = resolveRememberMe(cookieStore, options?.rememberMe);

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
              cookieStore.set(
                name,
                value,
                applyRememberMeCookieOptions(name, cookieOptions, rememberMe) as Parameters<
                  typeof cookieStore.set
                >[2],
              );
            });
          } catch {
            // Called from a Server Component — middleware will refresh the session.
          }
        },
      },
    },
  );
}
