import { describe, expect, it } from "vitest";
import {
  buildAdminIssuesHref,
  parseAdminIssueFilters,
} from "@/lib/admin/filters";

describe("admin issue filter helpers", () => {
  it("parses admin filters and pagination", () => {
    expect(
      parseAdminIssueFilters({
        status: "rejected",
        category: "trash",
        urgency: "critical",
        sort: "oldest",
        page: "2",
      }),
    ).toEqual({
      status: "rejected",
      category: "trash",
      urgency: "critical",
      sort: "oldest",
      page: 2,
      pageSize: 10,
    });
  });

  it("falls back to safe defaults for invalid filters", () => {
    expect(parseAdminIssueFilters({ status: "missing", page: "0" })).toEqual({
      sort: "newest",
      page: 1,
      pageSize: 10,
    });
  });

  it("builds compact admin issue hrefs", () => {
    expect(
      buildAdminIssuesHref({
        status: "open",
        category: undefined,
        urgency: "high",
        sort: "oldest",
        page: 3,
        pageSize: 10,
      }),
    ).toBe("/admin?status=open&urgency=high&sort=oldest&page=3");
  });
});
