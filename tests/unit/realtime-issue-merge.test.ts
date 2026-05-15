import { describe, expect, it } from "vitest";
import {
  applyPublicIssueRealtimeChange,
  getRealtimeStatusCopy,
  isPublicStatus,
  shouldShowIssueOnPublicMap,
  type RealtimeIssueChange,
} from "@/lib/realtime/issue-merge";
import type { PublicMapIssueMarker } from "@/lib/map/markers";

const openIssue: PublicMapIssueMarker = {
  id: "issue-1",
  title: "Open pothole",
  category: "pothole",
  urgency: "medium",
  status: "open",
  latitude: 40,
  longitude: -74,
  address_label: null,
  created_at: "2026-05-15T12:00:00.000Z",
};

const highIssue: PublicMapIssueMarker = {
  ...openIssue,
  id: "issue-2",
  title: "High sidewalk concern",
  category: "sidewalk",
  urgency: "high",
};

describe("realtime issue merge helpers", () => {
  it("adds matching public issues to the map", () => {
    const change: RealtimeIssueChange = {
      eventType: "INSERT",
      issue: highIssue,
    };

    expect(
      applyPublicIssueRealtimeChange([openIssue], change, {
        urgency: "high",
      }),
    ).toEqual([highIssue, openIssue]);
  });

  it("updates matching issues in place", () => {
    const updatedIssue = {
      ...openIssue,
      status: "in_progress" as const,
    };

    expect(
      applyPublicIssueRealtimeChange(
        [openIssue],
        { eventType: "UPDATE", issue: updatedIssue },
        {},
      ),
    ).toEqual([updatedIssue]);
  });

  it("removes rejected or private issues from the public map", () => {
    expect(
      applyPublicIssueRealtimeChange(
        [openIssue],
        {
          eventType: "UPDATE",
          issue: {
            ...openIssue,
            is_public: false,
          },
        },
        {},
      ),
    ).toEqual([]);

    expect(
      shouldShowIssueOnPublicMap(
        {
          ...openIssue,
          status: "rejected",
        },
        {},
      ),
    ).toBe(false);
  });

  it("keeps filtered-out realtime issues off the public map", () => {
    expect(
      shouldShowIssueOnPublicMap(openIssue, {
        category: "streetlight",
      }),
    ).toBe(false);

    expect(
      applyPublicIssueRealtimeChange(
        [openIssue],
        { eventType: "UPDATE", issue: highIssue },
        { status: "resolved" },
      ),
    ).toEqual([openIssue]);
  });

  it("removes deleted issues by id", () => {
    expect(
      applyPublicIssueRealtimeChange(
        [openIssue],
        { eventType: "DELETE", oldIssueId: openIssue.id },
        {},
      ),
    ).toEqual([]);
  });

  it("returns realtime indicator copy", () => {
    expect(getRealtimeStatusCopy("connected")).toBe("Live");
    expect(getRealtimeStatusCopy("disabled")).toBe("Realtime disabled");
  });

  it("identifies statuses that are allowed on public realtime views", () => {
    expect(isPublicStatus("open")).toBe(true);
    expect(isPublicStatus("resolved")).toBe(true);
    expect(isPublicStatus("rejected")).toBe(false);
  });
});
