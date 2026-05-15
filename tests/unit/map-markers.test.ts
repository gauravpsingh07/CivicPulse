import { describe, expect, it } from "vitest";
import {
  buildPublicMapHref,
  getIssueMarkerStyle,
  getPublicMapCenter,
  getPublicMapStats,
  parsePublicMapFilters,
  type PublicMapIssueMarker,
} from "@/lib/map/markers";

const markerIssues: PublicMapIssueMarker[] = [
  {
    id: "issue-1",
    title: "Open pothole",
    category: "pothole",
    urgency: "medium",
    status: "open",
    latitude: 40,
    longitude: -74,
    address_label: null,
    created_at: "2026-05-15T12:00:00.000Z",
  },
  {
    id: "issue-2",
    title: "Critical sidewalk hazard",
    category: "sidewalk",
    urgency: "critical",
    status: "in_progress",
    latitude: 42,
    longitude: -72,
    address_label: null,
    created_at: "2026-05-15T12:00:00.000Z",
  },
];

describe("public map marker helpers", () => {
  it("parses only public-safe map filters", () => {
    expect(
      parsePublicMapFilters({
        status: "in_progress",
        category: "sidewalk",
        urgency: "critical",
      }),
    ).toEqual({
      status: "in_progress",
      category: "sidewalk",
      urgency: "critical",
    });

    expect(parsePublicMapFilters({ status: "rejected" })).toEqual({});
  });

  it("builds compact public map hrefs", () => {
    expect(
      buildPublicMapHref({
        status: "open",
        category: "pothole",
        urgency: "high",
      }),
    ).toBe("/map?status=open&category=pothole&urgency=high");

    expect(buildPublicMapHref({})).toBe("/map");
  });

  it("returns marker styles for status and high-priority urgency", () => {
    expect(getIssueMarkerStyle({ status: "open", urgency: "medium" })).toEqual({
      fillColor: "#dd694c",
      strokeColor: "#9d3f29",
      radius: 9,
      weight: 2,
    });

    expect(
      getIssueMarkerStyle({ status: "resolved", urgency: "critical" }),
    ).toEqual({
      fillColor: "#9d3f29",
      strokeColor: "#5c2419",
      radius: 13,
      weight: 3,
    });
  });

  it("summarizes visible map stats and center", () => {
    expect(getPublicMapStats(markerIssues)).toEqual({
      visibleCount: 2,
      openCount: 1,
      highPriorityCount: 1,
    });

    expect(getPublicMapCenter(markerIssues)).toEqual({
      latitude: 41,
      longitude: -73,
    });

    expect(getPublicMapCenter([])).toBeNull();
  });
});
