import { z } from "zod";
import { issueFiltersSchema } from "@/lib/validators/issue";
import type { IssueCategory, IssueStatus, IssueUrgency } from "@/lib/types";

export const ADMIN_ISSUES_PAGE_SIZE = 10;

const adminDateSortSchema = z.enum(["newest", "oldest"]);

export type AdminDateSort = z.infer<typeof adminDateSortSchema>;

export type AdminIssueFilters = {
  status?: IssueStatus;
  category?: IssueCategory;
  urgency?: IssueUrgency;
  sort: AdminDateSort;
  page: number;
  pageSize: number;
};

export type AdminSearchParams = Record<string, string | string[] | undefined>;

export function parseAdminIssueFilters(
  searchParams: AdminSearchParams | undefined,
): AdminIssueFilters {
  const parsed = issueFiltersSchema
    .extend({
      sort: adminDateSortSchema.default("newest"),
      pageSize: z.coerce
        .number()
        .int()
        .min(1)
        .max(50)
        .default(ADMIN_ISSUES_PAGE_SIZE),
    })
    .safeParse({
      status: getSingleParam(searchParams, "status") || undefined,
      category: getSingleParam(searchParams, "category") || undefined,
      urgency: getSingleParam(searchParams, "urgency") || undefined,
      sort: getSingleParam(searchParams, "sort") || undefined,
      page: getSingleParam(searchParams, "page") || undefined,
      pageSize: getSingleParam(searchParams, "pageSize") || undefined,
    });

  if (!parsed.success) {
    return {
      sort: "newest",
      page: 1,
      pageSize: ADMIN_ISSUES_PAGE_SIZE,
    };
  }

  return {
    status: parsed.data.status,
    category: parsed.data.category,
    urgency: parsed.data.urgency,
    sort: parsed.data.sort,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
  };
}

export function buildAdminIssuesHref(
  filters: AdminIssueFilters,
  overrides: Partial<AdminIssueFilters> = {},
) {
  const nextFilters = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (nextFilters.status) {
    params.set("status", nextFilters.status);
  }

  if (nextFilters.category) {
    params.set("category", nextFilters.category);
  }

  if (nextFilters.urgency) {
    params.set("urgency", nextFilters.urgency);
  }

  if (nextFilters.sort !== "newest") {
    params.set("sort", nextFilters.sort);
  }

  if (nextFilters.page > 1) {
    params.set("page", String(nextFilters.page));
  }

  return params.size ? `/admin?${params.toString()}` : "/admin";
}

function getSingleParam(params: AdminSearchParams | undefined, key: string) {
  const value = params?.[key];

  return Array.isArray(value) ? value[0] : value;
}
