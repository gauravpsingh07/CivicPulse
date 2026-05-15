import "server-only";

import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/profile";
import { getIssueImagePublicUrl } from "@/lib/images";
import type { AdminIssueFilters } from "@/lib/admin/filters";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

export type AdminIssue = Tables<"issues"> & {
  image_url: string | null;
  reporter: Pick<Tables<"profiles">, "id" | "full_name" | "role"> | null;
};

export type AdminIssueDetail = {
  issue: AdminIssue;
  timeline: Tables<"issue_status_history">[];
  comments: Tables<"issue_comments">[];
  notifications: Tables<"notifications">[];
};

export type AdminIssuesResult = {
  issues: AdminIssue[];
  totalCount: number;
  pageCount: number;
  summary: AdminIssueSummary;
  errorMessage: string | null;
};

export type AdminIssueSummary = {
  openCount: number;
  inProgressCount: number;
  resolvedOrClosedCount: number;
  highPriorityCount: number;
};

export async function getAdminIssues(
  filters: AdminIssueFilters,
): Promise<AdminIssuesResult> {
  await requireAdmin("/admin");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      issues: [],
      totalCount: 0,
      pageCount: 0,
      summary: emptySummary,
      errorMessage:
        "Supabase is not configured yet. Add public Supabase credentials to use the admin dashboard.",
    };
  }

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase.from("issues").select("*", { count: "exact" });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.urgency) {
    query = query.eq("urgency", filters.urgency);
  }

  const [{ data, error, count }, summary] = await Promise.all([
    query
      .order("created_at", { ascending: filters.sort === "oldest" })
      .range(from, to),
    getAdminIssueSummary(),
  ]);

  if (error) {
    return {
      issues: [],
      totalCount: 0,
      pageCount: 0,
      summary,
      errorMessage: error.message,
    };
  }

  const issues = await attachReporterProfiles(data ?? []);
  const totalCount = count ?? 0;

  return {
    issues,
    totalCount,
    pageCount: Math.ceil(totalCount / filters.pageSize),
    summary,
    errorMessage: null,
  };
}

export async function getAdminIssueById(
  issueId: string,
): Promise<AdminIssueDetail | null> {
  await requireAdmin(`/admin/issues/${issueId}`);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data: issue, error } = await supabase
    .from("issues")
    .select("*")
    .eq("id", issueId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!issue) {
    notFound();
  }

  const [adminIssues, timelineResult, commentsResult, notificationsResult] =
    await Promise.all([
      attachReporterProfiles([issue]),
      supabase
        .from("issue_status_history")
        .select("*")
        .eq("issue_id", issue.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("issue_comments")
        .select("*")
        .eq("issue_id", issue.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("notifications")
        .select("*")
        .eq("issue_id", issue.id)
        .order("created_at", { ascending: false }),
    ]);

  if (timelineResult.error) {
    throw new Error(timelineResult.error.message);
  }

  if (commentsResult.error) {
    throw new Error(commentsResult.error.message);
  }

  if (notificationsResult.error) {
    throw new Error(notificationsResult.error.message);
  }

  return {
    issue: adminIssues[0],
    timeline: timelineResult.data ?? [],
    comments: commentsResult.data ?? [],
    notifications: notificationsResult.data ?? [],
  };
}

async function getAdminIssueSummary(): Promise<AdminIssueSummary> {
  await requireAdmin("/admin");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return emptySummary;
  }

  const { data, error } = await supabase
    .from("issues")
    .select("status,urgency");

  if (error || !data) {
    return emptySummary;
  }

  return {
    openCount: data.filter((issue) => issue.status === "open").length,
    inProgressCount: data.filter((issue) => issue.status === "in_progress")
      .length,
    resolvedOrClosedCount: data.filter(
      (issue) => issue.status === "resolved" || issue.status === "closed",
    ).length,
    highPriorityCount: data.filter(
      (issue) => issue.urgency === "high" || issue.urgency === "critical",
    ).length,
  };
}

async function attachReporterProfiles(
  issues: Tables<"issues">[],
): Promise<AdminIssue[]> {
  const supabase = await createSupabaseServerClient();
  const reporterIds = Array.from(
    new Set(
      issues
        .map((issue) => issue.reporter_id)
        .filter((reporterId): reporterId is string => Boolean(reporterId)),
    ),
  );

  if (!supabase || !reporterIds.length) {
    return issues.map((issue) => withReporter(issue, null));
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id,full_name,role")
    .in("id", reporterIds);

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return issues.map((issue) =>
    withReporter(
      issue,
      issue.reporter_id ? profilesById.get(issue.reporter_id) || null : null,
    ),
  );
}

function withReporter(
  issue: Tables<"issues">,
  reporter: AdminIssue["reporter"],
): AdminIssue {
  return {
    ...issue,
    image_url: getIssueImagePublicUrl(issue.image_path),
    reporter,
  };
}

const emptySummary: AdminIssueSummary = {
  openCount: 0,
  inProgressCount: 0,
  resolvedOrClosedCount: 0,
  highPriorityCount: 0,
};
