import { describe, expect, it } from "vitest";
import { isAdminProfile } from "@/lib/auth/utils";

describe("admin guard helpers", () => {
  it("accepts only admin profiles", () => {
    expect(isAdminProfile({ role: "admin" })).toBe(true);
    expect(isAdminProfile({ role: "user" })).toBe(false);
    expect(isAdminProfile(null)).toBe(false);
  });
});
