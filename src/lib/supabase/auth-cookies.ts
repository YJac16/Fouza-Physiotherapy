/** Preference cookie — not an auth token; stores the user's remember-me choice. */
export const AUTH_REMEMBER_COOKIE = "fouza-auth-remember";

/** 30 days — clinic staff default (shared PC risk: sign out on shared devices). */
export const AUTH_REMEMBER_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function parseRememberMeFromForm(formData: FormData): boolean {
  return formData.get("rememberMe") === "true";
}

export function rememberMeFromCookieValue(value: string | undefined | null): boolean {
  return value !== "0";
}

export function isSupabaseAuthCookie(name: string): boolean {
  return name.startsWith("sb-");
}

export function applyRememberMeCookieOptions(
  name: string,
  options: Record<string, unknown> | undefined,
  rememberMe: boolean,
): Record<string, unknown> {
  if (!isSupabaseAuthCookie(name)) {
    return options ?? {};
  }

  const next: Record<string, unknown> = { ...(options ?? {}) };
  if (rememberMe) {
    next.maxAge = AUTH_REMEMBER_MAX_AGE_SECONDS;
  } else {
    delete next.maxAge;
    delete next.expires;
  }
  return next;
}
