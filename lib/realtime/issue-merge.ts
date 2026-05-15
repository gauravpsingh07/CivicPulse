import type { PublicMapFilters, PublicMapIssueMarker } from "@/lib/map/markers";
import type { IssueStatus } from "@/lib/types";

export type RealtimeIssueChange =
  | {
      eventType: "INSERT" | "UPDATE";
      issue: PublicMapIssueMarker & {
        is_public?: boolean;
      };
    }
  | {
      eventType: "DELETE";
      oldIssueId: string;
    };

export function applyPublicIssueRealtimeChange(
  issues: PublicMapIssueMarker[],
  change: RealtimeIssueChange,
  filters: PublicMapFilters,
) {
  if (change.eventType === "DELETE") {
    return issues.filter((issue) => issue.id !== change.oldIssueId);
  }

  if (!shouldShowIssueOnPublicMap(change.issue, filters)) {
    return issues.filter((issue) => issue.id !== change.issue.id);
  }

  const existingIndex = issues.findIndex(
    (issue) => issue.id === change.issue.id,
  );

  if (existingIndex === -1) {
    return [change.issue, ...issues];
  }

  return issues.map((issue, index) =>
    index === existingIndex ? change.issue : issue,
  );
}

export function shouldShowIssueOnPublicMap(
  issue: PublicMapIssueMarker & { is_public?: boolean },
  filters: PublicMapFilters,
) {
  if (issue.is_public === false || issue.status === "rejected") {
    return false;
  }

  if (filters.status && issue.status !== filters.status) {
    return false;
  }

  if (filters.category && issue.category !== filters.category) {
    return false;
  }

  if (filters.urgency && issue.urgency !== filters.urgency) {
    return false;
  }

  return true;
}

export function getRealtimeStatusCopy(
  status: "disabled" | "connecting" | "connected" | "reconnecting",
) {
  switch (status) {
    case "disabled":
      return "Realtime disabled";
    case "connecting":
      return "Connecting";
    case "connected":
      return "Live";
    case "reconnecting":
      return "Reconnecting";
  }
}

export function isPublicStatus(status: IssueStatus) {
  return status !== "rejected";
}
