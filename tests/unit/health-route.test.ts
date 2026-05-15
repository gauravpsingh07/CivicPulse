import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("health route", () => {
  it("returns basic public health metadata without secrets", async () => {
    const response = GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      app: "CivicPulse",
      ok: true,
    });
    expect(body.environment).toEqual(
      expect.objectContaining({
        hasAppUrl: expect.any(Boolean),
        hasSupabaseAnonKey: expect.any(Boolean),
        hasSupabaseUrl: expect.any(Boolean),
      }),
    );
    expect(JSON.stringify(body)).not.toContain("DISCORD_WEBHOOK_URL");
    expect(JSON.stringify(body)).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
