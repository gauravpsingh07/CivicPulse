import "server-only";

import { getPublicSafeIssueStats } from "@/lib/analytics/calculations";
import { isAdminProfile } from "@/lib/auth/utils";
import { getIssueImagePublicUrl } from "@/lib/images";
import type { PublicIssueFilters } from "@/lib/issues/filters";
import { isPubliclyVisibleIssueStatus } from "@/lib/issues/status";
import {
  PUBLIC_MAP_ISSUE_LIMIT,
  type PublicMapFilters,
} from "@/lib/map/markers";
import { toUserFacingQueryError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";

export type PublicIssue = Tables<"issues"> & {
  image_url: string | null;
};

export type PublicIssueDetail = {
  issue: PublicIssue;
  timeline: Tables<"issue_status_history">[];
  comments: Tables<"issue_comments">[];
  canViewPrivateComments: boolean;
};

export type PublicIssuesResult = {
  isConfigured: boolean;
  issues: PublicIssue[];
  totalCount: number;
  pageCount: number;
  errorMessage: string | null;
};

export type PublicMapIssuesResult = {
  isConfigured: boolean;
  issues: PublicIssue[];
  errorMessage: string | null;
};

export type PublicIssueStats = {
  isConfigured: boolean;
  totalPublicIssues: number;
  activeCount: number;
  resolvedCount: number;
  errorMessage: string | null;
};

export type IssueDetailResult =
  | {
      status: "ready";
      detail: PublicIssueDetail;
    }
  | {
      status: "missing_config";
      message: string;
    }
  | {
      status: "not_found";
      message: string;
    }
  | {
      status: "error";
      message: string;
    };

export async function getPublicIssues(
  filters: PublicIssueFilters,
): Promise<PublicIssuesResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      isConfigured: false,
      issues: [],
      totalCount: 0,
      pageCount: 0,
      errorMessage:
        "Supabase is not configured yet. Add the public URL and anon key to browse live issues.",
    };
  }

  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let query = supabase
    .from("issues")
    .select("*", { count: "exact" })
    .eq("is_public", true)
    .neq("status", "rejected");

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.urgency) {
    query = query.eq("urgency", filters.urgency);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: filters.sort === "oldest" })
    .range(from, to);

  if (error) {
    return {
      isConfigured: true,
      issues: [],
      totalCount: 0,
      pageCount: 0,
      errorMessage: toUserFacingQueryError(error),
    };
  }

  const totalCount = count ?? 0;

  return {
    isConfigured: true,
    issues: (data ?? []).map(withImageUrl),
    totalCount,
    pageCount: Math.ceil(totalCount / filters.pageSize),
    errorMessage: null,
  };
}

export async function getPublicMapIssues(
  filters: PublicMapFilters,
): Promise<PublicMapIssuesResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      isConfigured: false,
      issues: [],
      errorMessage:
        "Supabase is not configured yet. Add the public URL and anon key to browse live map data.",
    };
  }

  let query = supabase
    .from("issues")
    .select("*")
    .eq("is_public", true)
    .neq("status", "rejected");

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.urgency) {
    query = query.eq("urgency", filters.urgency);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(PUBLIC_MAP_ISSUE_LIMIT);

  if (error) {
    return {
      isConfigured: true,
      issues: [],
      errorMessage: toUserFacingQueryError(error),
    };
  }

  return {
    isConfigured: true,
    issues: (data ?? []).map(withImageUrl),
    errorMessage: null,
  };
}

export async function getPublicIssueStats(): Promise<PublicIssueStats> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      isConfigured: false,
      totalPublicIssues: 0,
      activeCount: 0,
      resolvedCount: 0,
      errorMessage:
        "Supabase is not configured yet. Public stats will appear after setup.",
    };
  }

  const { data, error } = await supabase
    .from("issues")
    .select("status")
    .eq("is_public", true)
    .neq("status", "rejected")
    .limit(500);

  if (error) {
    return {
      isConfigured: true,
      totalPublicIssues: 0,
      activeCount: 0,
      resolvedCount: 0,
      errorMessage: toUserFacingQueryError(error),
    };
  }

  return {
    isConfigured: true,
    ...getPublicSafeIssueStats(data ?? []),
    errorMessage: null,
  };
}

export async function getIssueById(id: string): Promise<IssueDetailResult> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "missing_config",
      message:
        "Supabase is not configured yet. Add the public URL and anon key to view issue details.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: issue, error: issueError } = await supabase
    .from("issues")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (issueError) {
    return {
      status: "error",
      message: toUserFacingQueryError(issueError),
    };
  }

  if (!issue) {
    return {
      status: "not_found",
      message: "This issue is not public or does not exist.",
    };
  }

  const isAdmin = isAdminProfile(profile);
  const isReporter = Boolean(user && issue.reporter_id === user.id);
  const isPublic =
    issue.is_public && isPubliclyVisibleIssueStatus(issue.status);

  if (!isPublic && !isReporter && !isAdmin) {
    return {
      status: "not_found",
      message: "This issue is not public or does not exist.",
    };
  }

  const [{ data: timeline, error: timelineError }, commentsResult] =
    await Promise.all([
      supabase
        .from("issue_status_history")
        .select("*")
        .eq("issue_id", issue.id)
        .order("created_at", { ascending: true }),
      buildCommentsQuery(supabase, issue.id, isAdmin),
    ]);

  if (timelineError) {
    return {
      status: "error",
      message: toUserFacingQueryError(timelineError),
    };
  }

  if (commentsResult.error) {
    return {
      status: "error",
      message: toUserFacingQueryError(commentsResult.error),
    };
  }

  return {
    status: "ready",
    detail: {
      issue: withImageUrl(issue),
      timeline: timeline ?? [],
      comments: commentsResult.data ?? [],
      canViewPrivateComments: isAdmin,
    },
  };
}

function withImageUrl(issue: Tables<"issues">): PublicIssue {
  return {
    ...issue,
    image_url: getIssueImagePublicUrl(issue.image_path),
  };
}

function buildCommentsQuery(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  issueId: string,
  includePrivateComments: boolean,
) {
  if (!supabase) {
    return Promise.resolve({ data: [], error: null });
  }

  let query = supabase
    .from("issue_comments")
    .select("*")
    .eq("issue_id", issueId)
    .order("created_at", { ascending: true });

  if (!includePrivateComments) {
    query = query.eq("is_public", true);
  }

  return query;
}
