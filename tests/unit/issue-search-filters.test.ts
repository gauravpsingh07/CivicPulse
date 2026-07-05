import { describe, expect, it } from "vitest";
import {
  buildPublicIssuesHref,
  parsePublicIssueFilters,
} from "@/lib/issues/filters";

describe("public issue search and near-me filters", () => {
  it("parses a search query and trims whitespace", () => {
    const filters = parsePublicIssueFilters({ q: "  broken light  " });

    expect(filters.search).toBe("broken light");
  });

  it("drops empty search values", () => {
    expect(parsePublicIssueFilters({ q: "   " }).search).toBeUndefined();
    expect(parsePublicIssueFilters({}).search).toBeUndefined();
  });

  it("parses valid near coordinates and rejects invalid ones", () => {
    const filters = parsePublicIssueFilters({
      nearLat: "40.7128",
      nearLng: "-74.006",
    });

    expect(filters.near).toEqual({ latitude: 40.7128, longitude: -74.006 });
    expect(
      parsePublicIssueFilters({ nearLat: "999", nearLng: "0" }).near,
    ).toBeUndefined();
    expect(parsePublicIssueFilters({ nearLat: "40.7" }).near).toBeUndefined();
  });

  it("round-trips search and near params through hrefs", () => {
    const filters = parsePublicIssueFilters({
      q: "pothole",
      nearLat: "40.712800",
      nearLng: "-74.006000",
      category: "pothole",
    });

    const href = buildPublicIssuesHref(filters);

    expect(href).toContain("q=pothole");
    expect(href).toContain("nearLat=40.712800");
    expect(href).toContain("nearLng=-74.006000");
    expect(href).toContain("category=pothole");
  });

  it("clears near coordinates through overrides", () => {
    const filters = parsePublicIssueFilters({
      nearLat: "40.7128",
      nearLng: "-74.006",
    });

    const href = buildPublicIssuesHref(filters, { near: undefined, page: 1 });

    expect(href).not.toContain("nearLat");
    expect(href).not.toContain("nearLng");
  });
});
