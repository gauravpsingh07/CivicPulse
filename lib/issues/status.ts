import {
  ISSUE_CATEGORIES,
  ISSUE_STATUSES,
  ISSUE_URGENCY_LEVELS,
} from "@/lib/constants";
import type { IssueCategory, IssueStatus, IssueUrgency } from "@/lib/types";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "neutral";

export const PUBLIC_ISSUE_STATUSES = ISSUE_STATUSES.filter(
  (status) => status.value !== "rejected",
);

export function isPubliclyVisibleIssueStatus(status: IssueStatus) {
  return status !== "rejected";
}

export function getIssueStatusLabel(status: IssueStatus) {
  return ISSUE_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export function getIssueCategoryLabel(category: IssueCategory) {
  return (
    ISSUE_CATEGORIES.find((item) => item.value === category)?.label ?? category
  );
}

export function getIssueUrgencyLabel(urgency: IssueUrgency) {
  return (
    ISSUE_URGENCY_LEVELS.find((item) => item.value === urgency)?.label ??
    urgency
  );
}

export function getIssueStatusBadgeVariant(status: IssueStatus): BadgeVariant {
  switch (status) {
    case "open":
      return "warning";
    case "in_progress":
      return "default";
    case "resolved":
    case "closed":
      return "success";
    case "rejected":
    case "duplicate":
      return "neutral";
  }
}

export function getIssueUrgencyBadgeVariant(
  urgency: IssueUrgency,
): BadgeVariant {
  switch (urgency) {
    case "low":
      return "neutral";
    case "medium":
      return "default";
    case "high":
      return "warning";
    case "critical":
      return "danger";
  }
}
