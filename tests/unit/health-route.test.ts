import { afterEach, describe, expect, it, vi } from "vitest";

describe("health route", () => {
  afterEach(() => {
    vi.doUnmock("@/lib/supabase/server");
    vi.resetModules();
  });

  it("returns public health metadata without secrets when Supabase is not configured", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createSupabaseServerClient: async () => null,
    }));

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      app: "CivicPulse",
      ok: true,
      database: "not_configured",
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

  it("reports ok with a reachable database", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createSupabaseServerClient: async () =>
        buildFakeClient({ error: null }),
    }));

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, database: "ok" });
  });

  it("degrades to 503 when the database is unreachable", async () => {
    vi.doMock("@/lib/supabase/server", () => ({
      createSupabaseServerClient: async () =>
        buildFakeClient({ error: { message: "TypeError: fetch failed" } }),
    }));

    const { GET } = await import("@/app/api/health/route");
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toMatchObject({ ok: false, database: "unreachable" });
  });
});

function buildFakeClient(result: { error: { message: string } | null }) {
  return {
    from: () => ({
      select: () => ({
        abortSignal: () => Promise.resolve(result),
      }),
    }),
  };
}
