import { z } from "zod";
import { ISSUE_CATEGORIES, ISSUE_URGENCY_LEVELS } from "@/lib/constants";
import { PUBLIC_ISSUE_STATUSES } from "@/lib/issues/status";
import type { IssueCategory, IssueStatus, IssueUrgency } from "@/lib/types";

export const PUBLIC_MAP_ISSUE_LIMIT = 100;

const publicMapStatusValues = PUBLIC_ISSUE_STATUSES.map(
  (status) => status.value,
) as [Exclude<IssueStatus, "rejected">, ...Exclude<IssueStatus, "rejected">[]];

const issueCategoryValues = ISSUE_CATEGORIES.map((item) => item.value) as [
  IssueCategory,
  ...IssueCategory[],
];

const issueUrgencyValues = ISSUE_URGENCY_LEVELS.map((item) => item.value) as [
  IssueUrgency,
  ...IssueUrgency[],
];

const publicMapFiltersSchema = z.object({
  status: z.enum(publicMapStatusValues).optional(),
  category: z.enum(issueCategoryValues).optional(),
  urgency: z.enum(issueUrgencyValues).optional(),
});

export type PublicMapFilters = z.infer<typeof publicMapFiltersSchema>;

export type PublicMapSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type PublicMapIssueMarker = {
  id: string;
  title: string;
  category: IssueCategory;
  urgency: IssueUrgency;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  address_label: string | null;
  created_at: string;
};

export type IssueMarkerStyle = {
  fillColor: string;
  strokeColor: string;
  radius: number;
  weight: number;
};

export function parsePublicMapFilters(
  searchParams: PublicMapSearchParams | undefined,
): PublicMapFilters {
  const parsed = publicMapFiltersSchema.safeParse({
    status: getSingleParam(searchParams, "status") || undefined,
    category: getSingleParam(searchParams, "category") || undefined,
    urgency: getSingleParam(searchParams, "urgency") || undefined,
  });

  return parsed.success ? parsed.data : {};
}

export function buildPublicMapHref(filters: PublicMapFilters) {
  const params = new URLSearchParams();

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.urgency) {
    params.set("urgency", filters.urgency);
  }

  return params.size ? `/map?${params.toString()}` : "/map";
}

export function getIssueMarkerStyle(
  issue: Pick<PublicMapIssueMarker, "status" | "urgency">,
): IssueMarkerStyle {
  const statusColor = getStatusColor(issue.status);
  const isHighPriority =
    issue.urgency === "high" || issue.urgency === "critical";
  const isCritical = issue.urgency === "critical";

  return {
    fillColor: isCritical ? "#9d3f29" : statusColor.fill,
    strokeColor: isCritical
      ? "#5c2419"
      : isHighPriority
        ? "#8a5b0d"
        : statusColor.stroke,
    radius: isCritical ? 13 : isHighPriority ? 11 : 9,
    weight: isHighPriority ? 3 : 2,
  };
}

export function getPublicMapStats(issues: PublicMapIssueMarker[]) {
  return {
    visibleCount: issues.length,
    openCount: issues.filter((issue) => issue.status === "open").length,
    highPriorityCount: issues.filter(
      (issue) => issue.urgency === "high" || issue.urgency === "critical",
    ).length,
  };
}

export function getPublicMapCenter(issues: PublicMapIssueMarker[]) {
  if (!issues.length) {
    return null;
  }

  const totals = issues.reduce(
    (sum, issue) => ({
      latitude: sum.latitude + Number(issue.latitude),
      longitude: sum.longitude + Number(issue.longitude),
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: totals.latitude / issues.length,
    longitude: totals.longitude / issues.length,
  };
}

function getStatusColor(status: IssueStatus) {
  switch (status) {
    case "open":
      return { fill: "#dd694c", stroke: "#9d3f29" };
    case "in_progress":
      return { fill: "#3478a8", stroke: "#215d86" };
    case "resolved":
    case "closed":
      return { fill: "#1f8a5b", stroke: "#12633f" };
    case "duplicate":
      return { fill: "#d2942c", stroke: "#8a5b0d" };
    case "rejected":
      return { fill: "#8a948c", stroke: "#5e6a60" };
  }
}

function getSingleParam(
  params: PublicMapSearchParams | undefined,
  key: string,
) {
  const value = params?.[key];

  return Array.isArray(value) ? value[0] : value;
}
