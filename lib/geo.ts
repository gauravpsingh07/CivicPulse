export type Coordinates = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_METERS = 6371000;

export function haversineDistanceMeters(a: Coordinates, b: Coordinates) {
  const latDelta = toRadians(b.latitude - a.latitude);
  const lngDelta = toRadians(b.longitude - a.longitude);
  const chord =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) *
      Math.cos(toRadians(b.latitude)) *
      Math.sin(lngDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(chord));
}

export function formatDistanceLabel(distanceMeters: number) {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) {
    return null;
  }

  if (distanceMeters < 1000) {
    return `${Math.max(1, Math.round(distanceMeters))} m away`;
  }

  const kilometers = distanceMeters / 1000;

  return `${kilometers >= 10 ? Math.round(kilometers) : kilometers.toFixed(1)} km away`;
}

export function parseCoordinatePair(
  latitudeValue: string | undefined,
  longitudeValue: string | undefined,
): Coordinates | null {
  const latitude = parseFiniteNumber(latitudeValue);
  const longitude = parseFiniteNumber(longitudeValue);

  if (
    latitude === null ||
    longitude === null ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
}

function parseFiniteNumber(value: string | undefined) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
