import { describe, expect, it } from "vitest";
import {
  formatDateOnly,
  formatDateTime,
  getResolutionDurationLabel,
} from "@/lib/dates";

describe("date helpers", () => {
  it("formats dates in deterministic UTC text", () => {
    expect(formatDateOnly("2026-05-15T14:30:00.000Z")).toBe("May 15, 2026");
    expect(formatDateTime("2026-05-15T14:30:00.000Z")).toBe(
      "May 15, 2026 at 2:30 PM UTC",
    );
  });

  it("handles missing and invalid dates gracefully", () => {
    expect(formatDateOnly(null)).toBe("Unknown date");
    expect(formatDateTime("not-a-date")).toBe("Unknown date");
  });

  it("summarizes resolution duration", () => {
    expect(
      getResolutionDurationLabel(
        "2026-05-14T12:00:00.000Z",
        "2026-05-15T12:00:00.000Z",
      ),
    ).toBe("1 day");

    expect(getResolutionDurationLabel("2026-05-14T12:00:00.000Z", null)).toBe(
      "Not resolved yet",
    );
  });
});
