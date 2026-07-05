import { z } from "zod";
import { parseCoordinatePair, type Coordinates } from "@/lib/geo";
import { issueFiltersSchema } from "@/lib/validators/issue";
import type { IssueCategory, IssueStatus, IssueUrgency } from "@/lib/types";

export const PUBLIC_ISSUES_PAGE_SIZE = 6;
export const SEARCH_QUERY_MAX_LENGTH = 120;

export const issueDateSortSchema = z.enum(["newest", "oldest"]);

export type IssueDateSort = z.infer<typeof issueDateSortSchema>;

export type PublicIssueFilters = {
  status?: IssueStatus;
  category?: IssueCategory;
  urgency?: IssueUrgency;
  search?: string;
  near?: Coordinates;
  sort: IssueDateSort;
  page: number;
  pageSize: number;
};

export type SearchParamRecord = Record<string, string | string[] | undefined>;

export function parsePublicIssueFilters(
  searchParams: SearchParamRecord | undefined,
): PublicIssueFilters {
  const near =
    parseCoordinatePair(
      getSingleParam(searchParams, "nearLat"),
      getSingleParam(searchParams, "nearLng"),
    ) ?? undefined;

  const parsed = issueFiltersSchema
    .extend({
      sort: issueDateSortSchema.default("newest"),
      search: z.preprocess(
        (value) =>
          typeof value === "string" && value.trim() === "" ? undefined : value,
        z.string().trim().max(SEARCH_QUERY_MAX_LENGTH).optional(),
      ),
      pageSize: z.coerce
        .number()
        .int()
        .min(1)
        .max(24)
        .default(PUBLIC_ISSUES_PAGE_SIZE),
    })
    .safeParse({
      status: getSingleParam(searchParams, "status") || undefined,
      category: getSingleParam(searchParams, "category") || undefined,
      urgency: getSingleParam(searchParams, "urgency") || undefined,
      search: getSingleParam(searchParams, "q"),
      sort: getSingleParam(searchParams, "sort") || undefined,
      page: getSingleParam(searchParams, "page") || undefined,
      pageSize: getSingleParam(searchParams, "pageSize") || undefined,
    });

  if (!parsed.success) {
    return {
      near,
      sort: "newest",
      page: 1,
      pageSize: PUBLIC_ISSUES_PAGE_SIZE,
    };
  }

  return {
    status: parsed.data.status,
    category: parsed.data.category,
    urgency: parsed.data.urgency,
    search: parsed.data.search,
    near,
    sort: parsed.data.sort,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
  };
}

export function buildPublicIssuesHref(
  filters: PublicIssueFilters,
  overrides: Partial<PublicIssueFilters> = {},
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

  if (nextFilters.search) {
    params.set("q", nextFilters.search);
  }

  if (nextFilters.near) {
    params.set("nearLat", nextFilters.near.latitude.toFixed(6));
    params.set("nearLng", nextFilters.near.longitude.toFixed(6));
  }

  if (nextFilters.sort !== "newest") {
    params.set("sort", nextFilters.sort);
  }

  if (nextFilters.page > 1) {
    params.set("page", String(nextFilters.page));
  }

  return params.size ? `/issues?${params.toString()}` : "/issues";
}

function getSingleParam(params: SearchParamRecord | undefined, key: string) {
  const value = params?.[key];

  return Array.isArray(value) ? value[0] : value;
}
