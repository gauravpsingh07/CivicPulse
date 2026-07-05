import "server-only";

import { requireAdmin } from "@/lib/auth/profile";
import {
  calculateAverageResolutionTime,
  calculateIssueCategoryCounts,
  calculateIssueStatusCounts,
  calculateUrgencyCounts,
  type AnalyticsCount,
  type AverageResolutionTime,
} from "@/lib/analytics/calculations";
import { toUserFacingQueryError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

export type RecentActivityItem = {
  id: string;
  issueId: string;
  issueTitle: string;
  changedBy: string;
  fromStatus: Tables<"issue_status_history">["from_status"];
  toStatus: Tables<"issue_status_history">["to_status"];
  note: string | null;
  createdAt: string;
};

export type AdminAnalyticsDashboard = {
  statusCounts: AnalyticsCount[];
  categoryCounts: AnalyticsCount[];
  urgencyCounts: AnalyticsCount[];
  averageResolutionTime: AverageResolutionTime;
  recentActivity: RecentActivityItem[];
  errorMessage: string | null;
};

type AnalyticsIssueRow = Pick<
  Tables<"issues">,
  "id" | "status" | "category" | "urgency" | "created_at" | "resolved_at"
>;

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>;

export async function getIssueStatusCounts(): Promise<AnalyticsCount[]> {
  await requireAdmin("/admin");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return calculateIssueStatusCounts([]);
  }

  const { data, error } = await supabase.from("issues").select("status");

  if (error) {
    return calculateIssueStatusCounts([]);
  }

  return calculateIssueStatusCounts(data ?? []);
}

export async function getIssueCategoryCounts(): Promise<AnalyticsCount[]> {
  await requireAdmin("/admin");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return calculateIssueCategoryCounts([]);
  }

  const { data, error } = await supabase.from("issues").select("category");

  if (error) {
    return calculateIssueCategoryCounts([]);
  }

  return calculateIssueCategoryCounts(data ?? []);
}

export async function getUrgencyCounts(): Promise<AnalyticsCount[]> {
  await requireAdmin("/admin");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return calculateUrgencyCounts([]);
  }

  const { data, error } = await supabase.from("issues").select("urgency");

  if (error) {
    return calculateUrgencyCounts([]);
  }

  return calculateUrgencyCounts(data ?? []);
}

export async function getAverageResolutionTime(): Promise<AverageResolutionTime> {
  await requireAdmin("/admin");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return calculateAverageResolutionTime([]);
  }

  const { data, error } = await supabase
    .from("issues")
    .select("status,created_at,resolved_at")
    .in("status", ["resolved", "closed"])
    .not("resolved_at", "is", null);

  if (error) {
    return calculateAverageResolutionTime([]);
  }

  return calculateAverageResolutionTime(data ?? []);
}

export async function getRecentActivityFeed(
  limit = 8,
): Promise<RecentActivityItem[]> {
  await requireAdmin("/admin");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  return getRecentActivityFeedWithClient(supabase, limit);
}

export async function getAdminAnalyticsDashboard(): Promise<AdminAnalyticsDashboard> {
  await requireAdmin("/admin");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ...emptyDashboard,
      errorMessage:
        "Supabase is not configured yet. Add public Supabase credentials to view analytics.",
    };
  }

  const [issuesResult, recentActivity] = await Promise.all([
    supabase
      .from("issues")
      .select("id,status,category,urgency,created_at,resolved_at")
      .returns<AnalyticsIssueRow[]>(),
    getRecentActivityFeedWithClient(supabase),
  ]);

  if (issuesResult.error) {
    return {
      ...emptyDashboard,
      recentActivity,
      errorMessage: toUserFacingQueryError(issuesResult.error),
    };
  }

  const issues = issuesResult.data ?? [];

  return {
    statusCounts: calculateIssueStatusCounts(issues),
    categoryCounts: calculateIssueCategoryCounts(issues),
    urgencyCounts: calculateUrgencyCounts(issues),
    averageResolutionTime: calculateAverageResolutionTime(issues),
    recentActivity,
    errorMessage: null,
  };
}

async function getRecentActivityFeedWithClient(
  supabase: SupabaseServerClient,
  limit = 8,
) {
  const { data: history, error } = await supabase
    .from("issue_status_history")
    .select("id,issue_id,changed_by,from_status,to_status,note,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !history?.length) {
    return [];
  }

  const issueIds = Array.from(new Set(history.map((item) => item.issue_id)));
  const profileIds = Array.from(
    new Set(
      history
        .map((item) => item.changed_by)
        .filter((profileId): profileId is string => Boolean(profileId)),
    ),
  );

  const [issuesResult, profilesResult] = await Promise.all([
    supabase.from("issues").select("id,title").in("id", issueIds),
    profileIds.length
      ? supabase.from("profiles").select("id,full_name").in("id", profileIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const titlesById = new Map(
    (issuesResult.data ?? []).map((issue) => [issue.id, issue.title]),
  );
  const profilesById = new Map(
    (profilesResult.data ?? []).map((profile) => [
      profile.id,
      profile.full_name || "Admin",
    ]),
  );

  return history.map((item) => ({
    id: item.id,
    issueId: item.issue_id,
    issueTitle: titlesById.get(item.issue_id) || "Unknown issue",
    changedBy: item.changed_by
      ? profilesById.get(item.changed_by) || "Admin"
      : "System",
    fromStatus: item.from_status,
    toStatus: item.to_status,
    note: item.note,
    createdAt: item.created_at,
  }));
}

const emptyDashboard: AdminAnalyticsDashboard = {
  statusCounts: calculateIssueStatusCounts([]),
  categoryCounts: calculateIssueCategoryCounts([]),
  urgencyCounts: calculateUrgencyCounts([]),
  averageResolutionTime: calculateAverageResolutionTime([]),
  recentActivity: [],
  errorMessage: null,
};
