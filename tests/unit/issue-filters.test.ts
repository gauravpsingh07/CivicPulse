import { describe, expect, it } from "vitest";
import {
  buildPublicIssuesHref,
  parsePublicIssueFilters,
} from "@/lib/issues/filters";

describe("public issue filter parsing", () => {
  it("parses supported filters and coerces page values", () => {
    expect(
      parsePublicIssueFilters({
        status: "open",
        category: "pothole",
        urgency: "high",
        sort: "oldest",
        page: "3",
      }),
    ).toEqual({
      status: "open",
      category: "pothole",
      urgency: "high",
      sort: "oldest",
      page: 3,
      pageSize: 6,
    });
  });

  it("falls back to safe defaults for invalid params", () => {
    expect(
      parsePublicIssueFilters({
        status: "unknown",
        sort: "sideways",
        page: "-4",
      }),
    ).toEqual({
      sort: "newest",
      page: 1,
      pageSize: 6,
    });
  });

  it("builds compact issue list hrefs", () => {
    expect(
      buildPublicIssuesHref({
        status: "in_progress",
        category: "streetlight",
        urgency: undefined,
        sort: "oldest",
        page: 2,
        pageSize: 6,
      }),
    ).toBe(
      "/issues?status=in_progress&category=streetlight&sort=oldest&page=2",
    );

    expect(
      buildPublicIssuesHref({
        sort: "newest",
        page: 1,
        pageSize: 6,
      }),
    ).toBe("/issues");
  });
});
