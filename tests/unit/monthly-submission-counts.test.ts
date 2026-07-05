import { describe, expect, it } from "vitest";
import { calculateMonthlySubmissionCounts } from "@/lib/analytics/calculations";

describe("calculateMonthlySubmissionCounts", () => {
  const now = new Date("2026-07-04T12:00:00Z");

  it("buckets issues into the trailing months", () => {
    const counts = calculateMonthlySubmissionCounts(
      [
        { created_at: "2026-07-01T00:00:00Z" },
        { created_at: "2026-07-03T10:00:00Z" },
        { created_at: "2026-05-15T10:00:00Z" },
        { created_at: "2026-02-01T00:00:00Z" },
      ],
      6,
      now,
    );

    expect(counts).toHaveLength(6);
    expect(counts[0]).toMatchObject({ key: "2026-02", count: 1 });
    expect(counts[3]).toMatchObject({ key: "2026-05", count: 1 });
    expect(counts[5]).toMatchObject({ key: "2026-07", count: 2 });
  });

  it("ignores issues outside the window and invalid dates", () => {
    const counts = calculateMonthlySubmissionCounts(
      [
        { created_at: "2025-01-01T00:00:00Z" },
        { created_at: "not-a-date" },
        { created_at: null },
      ],
      6,
      now,
    );

    expect(counts.every((bucket) => bucket.count === 0)).toBe(true);
  });

  it("labels buckets with month and year", () => {
    const counts = calculateMonthlySubmissionCounts([], 2, now);

    expect(counts.map((bucket) => bucket.label)).toEqual([
      "Jun 2026",
      "Jul 2026",
    ]);
  });
});
