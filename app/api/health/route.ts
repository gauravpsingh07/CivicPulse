import { NextResponse } from "next/server";
import { getPublicEnvironmentStatus } from "@/lib/supabase/env";

export function GET() {
  const environment = getPublicEnvironmentStatus();

  return NextResponse.json({
    app: "CivicPulse",
    ok: true,
    environment,
    timestamp: new Date().toISOString(),
  });
}
