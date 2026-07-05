import { describe, expect, it } from "vitest";
import {
  formatDistanceLabel,
  haversineDistanceMeters,
  parseCoordinatePair,
} from "@/lib/geo";

describe("geo helpers", () => {
  it("computes haversine distance within tolerance", () => {
    // Empire State Building -> Statue of Liberty is roughly 8.2 km.
    const distance = haversineDistanceMeters(
      { latitude: 40.748817, longitude: -73.985428 },
      { latitude: 40.689247, longitude: -74.044502 },
    );

    expect(distance).toBeGreaterThan(7800);
    expect(distance).toBeLessThan(8600);
  });

  it("returns zero distance for identical points", () => {
    const point = { latitude: 40.7128, longitude: -74.006 };

    expect(haversineDistanceMeters(point, point)).toBe(0);
  });

  it("formats distances for meters and kilometers", () => {
    expect(formatDistanceLabel(42)).toBe("42 m away");
    expect(formatDistanceLabel(999)).toBe("999 m away");
    expect(formatDistanceLabel(1200)).toBe("1.2 km away");
    expect(formatDistanceLabel(15400)).toBe("15 km away");
    expect(formatDistanceLabel(-5)).toBeNull();
    expect(formatDistanceLabel(Number.NaN)).toBeNull();
  });

  it("parses valid coordinate pairs and rejects out-of-range values", () => {
    expect(parseCoordinatePair("40.7128", "-74.006")).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
    });
    expect(parseCoordinatePair("91", "0")).toBeNull();
    expect(parseCoordinatePair("0", "181")).toBeNull();
    expect(parseCoordinatePair("not-a-number", "0")).toBeNull();
    expect(parseCoordinatePair(undefined, "0")).toBeNull();
    expect(parseCoordinatePair("", "")).toBeNull();
  });
});
