import {
  ISSUE_CATEGORIES,
  ISSUE_STATUSES,
  ISSUE_URGENCY_LEVELS,
} from "@/lib/constants";
import type { IssueCategory, IssueStatus, IssueUrgency } from "@/lib/types";

export type AnalyticsCount = {
  key: string;
  label: string;
  count: number;
};

export type ResolutionIssueInput = {
  created_at: string | null;
  resolved_at: string | null;
  status: IssueStatus;
};

export type AverageResolutionTime = {
  averageHours: number | null;
  issueCount: number;
  label: string;
};

export function calculateIssueStatusCounts(
  issues: ReadonlyArray<{ status: IssueStatus }>,
): AnalyticsCount[] {
  return ISSUE_STATUSES.map((status) => ({
    key: status.value,
    label: status.label,
    count: issues.filter((issue) => issue.status === status.value).length,
  }));
}

export function calculateIssueCategoryCounts(
  issues: ReadonlyArray<{ category: IssueCategory }>,
): AnalyticsCount[] {
  return ISSUE_CATEGORIES.map((category) => ({
    key: category.value,
    label: category.label,
    count: issues.filter((issue) => issue.category === category.value).length,
  }));
}

export function calculateUrgencyCounts(
  issues: ReadonlyArray<{ urgency: IssueUrgency }>,
): AnalyticsCount[] {
  return ISSUE_URGENCY_LEVELS.map((urgency) => ({
    key: urgency.value,
    label: urgency.label,
    count: issues.filter((issue) => issue.urgency === urgency.value).length,
  }));
}

export function calculateAverageResolutionTime(
  issues: ReadonlyArray<ResolutionIssueInput>,
): AverageResolutionTime {
  const durations = issues
    .filter(
      (issue) =>
        (issue.status === "resolved" || issue.status === "closed") &&
        issue.created_at &&
        issue.resolved_at,
    )
    .map((issue) => {
      const created = new Date(issue.created_at as string);
      const resolved = new Date(issue.resolved_at as string);

      if (Number.isNaN(created.getTime()) || Number.isNaN(resolved.getTime())) {
        return null;
      }

      return Math.max(0, resolved.getTime() - created.getTime());
    })
    .filter((duration): duration is number => duration !== null);

  if (!durations.length) {
    return {
      averageHours: null,
      issueCount: 0,
      label: "No resolved issues",
    };
  }

  const averageMs =
    durations.reduce((total, duration) => total + duration, 0) /
    durations.length;
  const averageHours = averageMs / (1000 * 60 * 60);

  return {
    averageHours,
    issueCount: durations.length,
    label: formatAverageResolutionTime(averageHours),
  };
}

export function formatAverageResolutionTime(hours: number | null) {
  if (hours === null) {
    return "No resolved issues";
  }

  if (hours < 24) {
    const roundedHours = Math.max(1, Math.round(hours));
    return `${roundedHours} hour${roundedHours === 1 ? "" : "s"}`;
  }

  const days = Math.max(1, Math.round(hours / 24));
  return `${days} day${days === 1 ? "" : "s"}`;
}

export type MonthlyCount = {
  key: string;
  label: string;
  count: number;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function calculateMonthlySubmissionCounts(
  issues: ReadonlyArray<{ created_at: string | null }>,
  monthCount = 6,
  now = new Date(),
): MonthlyCount[] {
  const buckets: MonthlyCount[] = [];
  const countsByKey = new Map<string, number>();

  for (let offset = monthCount - 1; offset >= 0; offset -= 1) {
    const month = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1),
    );
    const key = `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}`;

    countsByKey.set(key, 0);
    buckets.push({
      key,
      label: `${MONTH_LABELS[month.getUTCMonth()]} ${month.getUTCFullYear()}`,
      count: 0,
    });
  }

  for (const issue of issues) {
    if (!issue.created_at) {
      continue;
    }

    const created = new Date(issue.created_at);

    if (Number.isNaN(created.getTime())) {
      continue;
    }

    const key = `${created.getUTCFullYear()}-${String(created.getUTCMonth() + 1).padStart(2, "0")}`;

    if (countsByKey.has(key)) {
      countsByKey.set(key, (countsByKey.get(key) ?? 0) + 1);
    }
  }

  return buckets.map((bucket) => ({
    ...bucket,
    count: countsByKey.get(bucket.key) ?? 0,
  }));
}

export function getPublicSafeIssueStats(
  issues: ReadonlyArray<{ status: IssueStatus }>,
) {
  return {
    totalPublicIssues: issues.length,
    activeCount: issues.filter(
      (issue) => issue.status === "open" || issue.status === "in_progress",
    ).length,
    resolvedCount: issues.filter(
      (issue) => issue.status === "resolved" || issue.status === "closed",
    ).length,
  };
}
