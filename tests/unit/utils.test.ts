import { describe, expect, it } from "vitest";
import { ISSUE_STATUSES } from "@/lib/constants";
import { cn, formatIssueLabel } from "@/lib/utils";

describe("utils", () => {
  it("merges conflicting class names predictably", () => {
    expect(cn("px-2 text-sm", "px-4")).toBe("text-sm px-4");
  });

  it("formats enum values for display", () => {
    expect(formatIssueLabel("in_progress")).toBe("In Progress");
    expect(formatIssueLabel("water_leak")).toBe("Water Leak");
  });

  it("keeps the required status lifecycle in order", () => {
    expect(ISSUE_STATUSES.map((status) => status.value)).toEqual([
      "open",
      "in_progress",
      "resolved",
      "closed",
      "rejected",
      "duplicate",
    ]);
  });
});
