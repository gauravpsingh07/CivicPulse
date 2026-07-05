import { NextRequest, NextResponse } from "next/server";
import {
  GEOCODING_RESULT_LIMIT,
  normalizeGeocodingQuery,
  parseNominatimSearchResults,
} from "@/lib/geocoding/nominatim";
import { getAppUrl } from "@/lib/supabase/env";

const NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

export async function GET(request: NextRequest) {
  const parsedQuery = normalizeGeocodingQuery(
    request.nextUrl.searchParams.get("q"),
  );

  if (!parsedQuery.ok) {
    return NextResponse.json({ error: parsedQuery.message }, { status: 400 });
  }

  const searchUrl = new URL(NOMINATIM_SEARCH_URL);
  searchUrl.searchParams.set("q", parsedQuery.query);
  searchUrl.searchParams.set("format", "jsonv2");
  searchUrl.searchParams.set("limit", String(GEOCODING_RESULT_LIMIT));

  try {
    const response = await fetch(searchUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Referer: getAppUrl(),
        "User-Agent":
          "CivicPulse/1.0 location-search (https://github.com/gauravpsingh07/CivicPulse)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Location search failed." },
        { status: 502 },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      results: parseNominatimSearchResults(data),
    });
  } catch {
    return NextResponse.json(
      { error: "Location search failed." },
      { status: 502 },
    );
  }
}
