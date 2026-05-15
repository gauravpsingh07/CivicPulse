import { describe, expect, it } from "vitest";
import {
  getAuthMessage,
  getSafeNextPath,
  isAdminProfile,
} from "@/lib/auth/utils";
import { loginSchema, registerSchema } from "@/lib/validators/auth";

describe("auth validators", () => {
  it("normalizes login email and preserves safe next paths", () => {
    expect(
      loginSchema.parse({
        email: " Reporter@Example.COM ",
        password: "secret",
        next: "/issues/new",
      }),
    ).toEqual({
      email: "reporter@example.com",
      password: "secret",
      next: "/issues/new",
    });
  });

  it("requires strong enough registration details", () => {
    const result = registerSchema.safeParse({
      fullName: "A",
      email: "bad-email",
      password: "short",
      next: "/dashboard",
    });

    expect(result.success).toBe(false);
  });

  it("blocks external next-path redirects", () => {
    expect(getSafeNextPath("https://example.com")).toBe("/dashboard");
    expect(getSafeNextPath("//example.com")).toBe("/dashboard");
    expect(getSafeNextPath("/admin")).toBe("/admin");
  });

  it("detects admin profile shape without trusting client state", () => {
    expect(isAdminProfile({ role: "admin" })).toBe(true);
    expect(isAdminProfile({ role: "user" })).toBe(false);
    expect(isAdminProfile(null)).toBe(false);
  });

  it("maps auth query codes to user-facing messages", () => {
    expect(getAuthMessage("auth-required")).toBe("Sign in to continue.");
    expect(getAuthMessage("unknown")).toBeNull();
  });
});
