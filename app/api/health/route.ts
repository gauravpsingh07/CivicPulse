import { NextResponse } from "next/server";
import { getPublicEnvironmentStatus } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DATABASE_CHECK_TIMEOUT_MS = 5000;

export type HealthDatabaseStatus = "ok" | "unreachable" | "not_configured";

export async function GET() {
  const environment = getPublicEnvironmentStatus();
  const database = await getDatabaseStatus();
  const ok = database !== "unreachable";

  return NextResponse.json(
    {
      app: "CivicPulse",
      ok,
      database,
      environment,
      timestamp: new Date().toISOString(),
    },
    { status: ok ? 200 : 503 },
  );
}

async function getDatabaseStatus(): Promise<HealthDatabaseStatus> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return "not_configured";
  }

  try {
    const { error } = await supabase
      .from("issues")
      .select("id", { count: "exact", head: true })
      .abortSignal(AbortSignal.timeout(DATABASE_CHECK_TIMEOUT_MS));

    return error ? "unreachable" : "ok";
  } catch {
    return "unreachable";
  }
}
