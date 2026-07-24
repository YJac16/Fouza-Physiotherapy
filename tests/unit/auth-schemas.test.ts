import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/features/auth/schemas/auth";

describe("auth schemas", () => {
  it("accepts valid login", () => {
    const result = loginSchema.safeParse({
      email: "patient@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short passwords on register", () => {
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "patient@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("requires matching passwords", () => {
    const result = registerSchema.safeParse({
      fullName: "Test User",
      email: "patient@example.com",
      password: "password123",
      confirmPassword: "password456",
    });
    expect(result.success).toBe(false);
  });
});
