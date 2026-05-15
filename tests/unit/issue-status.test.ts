import { describe, expect, it } from "vitest";
import {
  getIssueCategoryLabel,
  getIssueStatusBadgeVariant,
  getIssueStatusLabel,
  getIssueUrgencyBadgeVariant,
  isPubliclyVisibleIssueStatus,
} from "@/lib/issues/status";

describe("issue status helpers", () => {
  it("returns display labels for issue enums", () => {
    expect(getIssueStatusLabel("in_progress")).toBe("In progress");
    expect(getIssueCategoryLabel("water_leak")).toBe("Water leak");
  });

  it("maps status and urgency to badge variants", () => {
    expect(getIssueStatusBadgeVariant("open")).toBe("warning");
    expect(getIssueStatusBadgeVariant("resolved")).toBe("success");
    expect(getIssueUrgencyBadgeVariant("critical")).toBe("danger");
  });

  it("hides rejected issues from public views", () => {
    expect(isPubliclyVisibleIssueStatus("open")).toBe(true);
    expect(isPubliclyVisibleIssueStatus("rejected")).toBe(false);
  });
});
