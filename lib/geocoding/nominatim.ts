export const GEOCODING_RESULT_LIMIT = 5;
export const GEOCODING_QUERY_MAX_LENGTH = 160;

export type GeocodingResult = {
  displayName: string;
  latitude: number;
  longitude: number;
};

export type GeocodingQueryResult =
  | {
      ok: true;
      query: string;
    }
  | {
      ok: false;
      message: string;
    };

export function normalizeGeocodingQuery(value: unknown): GeocodingQueryResult {
  if (typeof value !== "string") {
    return {
      ok: false,
      message: "Enter an address, landmark, street, or ZIP code to search.",
    };
  }

  const query = value.trim().replace(/\s+/g, " ");

  if (!query) {
    return {
      ok: false,
      message: "Enter an address, landmark, street, or ZIP code to search.",
    };
  }

  if (query.length > GEOCODING_QUERY_MAX_LENGTH) {
    return {
      ok: false,
      message: "Search text must be 160 characters or fewer.",
    };
  }

  return { ok: true, query };
}

export function parseNominatimSearchResults(value: unknown): GeocodingResult[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(parseNominatimSearchResult)
    .filter((result): result is GeocodingResult => result !== null)
    .slice(0, GEOCODING_RESULT_LIMIT);
}

function parseNominatimSearchResult(value: unknown): GeocodingResult | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const displayName =
    typeof row.display_name === "string" ? row.display_name.trim() : "";
  const latitude = parseCoordinate(row.lat);
  const longitude = parseCoordinate(row.lon);

  if (
    !displayName ||
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    displayName,
    latitude,
    longitude,
  };
}

function parseCoordinate(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}
