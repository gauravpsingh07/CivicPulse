import { describe, expect, it } from "vitest";
import {
  GEOCODING_RESULT_LIMIT,
  normalizeGeocodingQuery,
  parseNominatimSearchResults,
} from "@/lib/geocoding/nominatim";

describe("geocoding helpers", () => {
  it("normalizes submitted address, place, and ZIP search text", () => {
    expect(normalizeGeocodingQuery("  Boston   Common  ")).toEqual({
      ok: true,
      query: "Boston Common",
    });
  });

  it("rejects empty search queries before a geocoding request", () => {
    expect(normalizeGeocodingQuery("   ")).toEqual({
      ok: false,
      message: "Enter an address, landmark, street, or ZIP code to search.",
    });
  });

  it("parses valid Nominatim results and drops invalid coordinates", () => {
    expect(
      parseNominatimSearchResults([
        {
          display_name: "Boston Common, Boston, Massachusetts, United States",
          lat: "42.3555",
          lon: "-71.0656",
        },
        {
          display_name: "Invalid place",
          lat: "not-a-number",
          lon: "-71.0",
        },
      ]),
    ).toEqual([
      {
        displayName: "Boston Common, Boston, Massachusetts, United States",
        latitude: 42.3555,
        longitude: -71.0656,
      },
    ]);
  });

  it("keeps parsed results capped for free-tier-friendly usage", () => {
    const rows = Array.from(
      { length: GEOCODING_RESULT_LIMIT + 3 },
      (_, index) => ({
        display_name: `Place ${index}`,
        lat: String(40 + index / 100),
        lon: String(-70 - index / 100),
      }),
    );

    expect(parseNominatimSearchResults(rows)).toHaveLength(
      GEOCODING_RESULT_LIMIT,
    );
  });
});
