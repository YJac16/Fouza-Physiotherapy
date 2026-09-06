import { describe, expect, it } from "vitest";

import {
  applyRememberMeCookieOptions,
  parseRememberMeFromForm,
  rememberMeFromCookieValue,
} from "@/lib/supabase/auth-cookies";

describe("parseRememberMeFromForm", () => {
  it("defaults to unchecked when the box is absent", () => {
    const formData = new FormData();
    expect(parseRememberMeFromForm(formData)).toBe(false);
  });

  it("returns true when rememberMe=true is posted", () => {
    const formData = new FormData();
    formData.set("rememberMe", "true");
    expect(parseRememberMeFromForm(formData)).toBe(true);
  });
});

describe("rememberMeFromCookieValue", () => {
  it("defaults to remembered unless explicitly disabled", () => {
    expect(rememberMeFromCookieValue(undefined)).toBe(true);
    expect(rememberMeFromCookieValue("1")).toBe(true);
    expect(rememberMeFromCookieValue("0")).toBe(false);
  });
});

describe("applyRememberMeCookieOptions", () => {
  it("extends auth cookie lifetime when remember me is enabled", () => {
    const options = applyRememberMeCookieOptions(
      "sb-test-auth-token",
      { path: "/" },
      true,
    );
    expect(options.maxAge).toBe(60 * 60 * 24 * 30);
  });

  it("uses a session cookie when remember me is disabled", () => {
    const options = applyRememberMeCookieOptions(
      "sb-test-auth-token",
      { path: "/", maxAge: 999 },
      false,
    );
    expect(options.maxAge).toBeUndefined();
    expect(options.expires).toBeUndefined();
  });
});
