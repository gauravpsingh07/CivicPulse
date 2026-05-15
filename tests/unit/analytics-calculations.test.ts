import { describe, expect, it } from "vitest";
import {
  calculateAverageResolutionTime,
  calculateIssueCategoryCounts,
  calculateIssueStatusCounts,
  calculateUrgencyCounts,
  formatAverageResolutionTime,
  getPublicSafeIssueStats,
} from "@/lib/analytics/calculations";

const issues = [
  {
    status: "open",
    category: "pothole",
    urgency: "high",
    created_at: "2026-05-10T10:00:00.000Z",
    resolved_at: null,
  },
  {
    status: "in_progress",
    category: "streetlight",
    urgency: "critical",
    created_at: "2026-05-10T10:00:00.000Z",
    resolved_at: null,
  },
  {
    status: "resolved",
    category: "pothole",
    urgency: "medium",
    created_at: "2026-05-10T10:00:00.000Z",
    resolved_at: "2026-05-11T10:00:00.000Z",
  },
  {
    status: "closed",
    category: "trash",
    urgency: "low",
    created_at: "2026-05-10T10:00:00.000Z",
    resolved_at: "2026-05-12T10:00:00.000Z",
  },
] as const;

describe("analytics calculations", () => {
  it("counts issue statuses, categories, and urgency levels", () => {
    expect(
      calculateIssueStatusCounts(issues).find((item) => item.key === "open")
        ?.count,
    ).toBe(1);
    expect(
      calculateIssueCategoryCounts(issues).find(
        (item) => item.key === "pothole",
      )?.count,
    ).toBe(2);
    expect(
      calculateUrgencyCounts(issues).find((item) => item.key === "critical")
        ?.count,
    ).toBe(1);
  });

  it("calculates average resolution time from resolved and closed issues", () => {
    const result = calculateAverageResolutionTime(issues);

    expect(result.issueCount).toBe(2);
    expect(result.averageHours).toBe(36);
    expect(result.label).toBe("2 days");
  });

  it("handles empty or unresolved resolution data", () => {
    expect(calculateAverageResolutionTime([])).toEqual({
      averageHours: null,
      issueCount: 0,
      label: "No resolved issues",
    });
    expect(formatAverageResolutionTime(2)).toBe("2 hours");
  });

  it("returns public-safe aggregate stats without private detail fields", () => {
    expect(getPublicSafeIssueStats(issues)).toEqual({
      totalPublicIssues: 4,
      activeCount: 2,
      resolvedCount: 2,
    });
  });
});
