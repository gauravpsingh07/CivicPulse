import { describe, expect, it } from "vitest";
import {
  DATABASE_UNREACHABLE_MESSAGE,
  isConnectionError,
  toUserFacingQueryError,
} from "@/lib/supabase/errors";

describe("supabase error helpers", () => {
  it("detects low-level connection failures", () => {
    expect(isConnectionError("TypeError: fetch failed")).toBe(true);
    expect(isConnectionError("getaddrinfo ENOTFOUND example.supabase.co")).toBe(
      true,
    );
    expect(isConnectionError("connect ECONNREFUSED 127.0.0.1:443")).toBe(true);
    expect(isConnectionError("Invalid login credentials")).toBe(false);
    expect(isConnectionError(null)).toBe(false);
  });

  it("replaces connection failures with a friendly message", () => {
    expect(toUserFacingQueryError({ message: "TypeError: fetch failed" })).toBe(
      DATABASE_UNREACHABLE_MESSAGE,
    );
    expect(toUserFacingQueryError(null)).toBe(DATABASE_UNREACHABLE_MESSAGE);
    expect(toUserFacingQueryError({ message: "  " })).toBe(
      DATABASE_UNREACHABLE_MESSAGE,
    );
  });

  it("passes through meaningful database errors unchanged", () => {
    expect(
      toUserFacingQueryError({ message: "Invalid login credentials" }),
    ).toBe("Invalid login credentials");
    expect(
      toUserFacingQueryError({
        message: 'new row violates row-level security policy for table "issues"',
      }),
    ).toBe('new row violates row-level security policy for table "issues"');
  });
});
