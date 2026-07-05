import { NextRequest, NextResponse } from "next/server";
import { parseCoordinatePair } from "@/lib/geo";
import { issueCategorySchema } from "@/lib/validators/issue";
import { toUserFacingQueryError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DUPLICATE_RADIUS_METERS = 400;
const MAX_SUGGESTIONS = 4;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const origin = parseCoordinatePair(
    params.get("lat") ?? undefined,
    params.get("lng") ?? undefined,
  );

  if (!origin) {
    return NextResponse.json(
      { error: "Provide valid lat and lng query parameters." },
      { status: 400 },
    );
  }

  const categoryResult = issueCategorySchema.safeParse(params.get("category"));
  const category = categoryResult.success ? categoryResult.data : null;

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ results: [] });
  }

  const { data, error } = await supabase.rpc("nearby_public_issues", {
    origin_lat: origin.latitude,
    origin_lng: origin.longitude,
    filter_category: category,
    max_results: 10,
  });

  if (error) {
    return NextResponse.json(
      { error: toUserFacingQueryError(error) },
      { status: 502 },
    );
  }

  const results = (data ?? [])
    .filter((row) => row.distance_meters <= DUPLICATE_RADIUS_METERS)
    .slice(0, MAX_SUGGESTIONS)
    .map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      category: row.category,
      upvote_count: row.upvote_count ?? 0,
      distance_meters: Math.round(row.distance_meters),
    }));

  return NextResponse.json({ results });
}
