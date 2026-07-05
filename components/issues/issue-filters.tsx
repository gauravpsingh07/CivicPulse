import Link from "next/link";
import type { ReactNode } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { NearMeButton } from "@/components/issues/near-me-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ISSUE_CATEGORIES, ISSUE_URGENCY_LEVELS } from "@/lib/constants";
import {
  buildPublicIssuesHref,
  SEARCH_QUERY_MAX_LENGTH,
  type PublicIssueFilters,
} from "@/lib/issues/filters";
import { PUBLIC_ISSUE_STATUSES } from "@/lib/issues/status";

export function IssueFilters({ filters }: { filters: PublicIssueFilters }) {
  return (
    <div className="space-y-4 rounded-lg border border-[var(--line)] bg-white p-4">
      <form action="/issues" className="space-y-4">
        {filters.near ? (
          <>
            <input
              name="nearLat"
              type="hidden"
              value={filters.near.latitude.toFixed(6)}
            />
            <input
              name="nearLng"
              type="hidden"
              value={filters.near.longitude.toFixed(6)}
            />
          </>
        ) : null}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <label className="block flex-1 space-y-2">
            <span className="text-sm font-semibold">Search</span>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]"
                aria-hidden="true"
              />
              <Input
                className="pl-9"
                defaultValue={filters.search || ""}
                maxLength={SEARCH_QUERY_MAX_LENGTH}
                name="q"
                placeholder="Search titles, descriptions, and addresses"
                type="search"
              />
            </div>
          </label>
          <NearMeButton filters={filters} />
        </div>

        <div className="grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
          <FilterSelect label="Status" name="status" value={filters.status}>
            <option value="">Any status</option>
            {PUBLIC_ISSUE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            label="Category"
            name="category"
            value={filters.category}
          >
            <option value="">Any category</option>
            {ISSUE_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Urgency" name="urgency" value={filters.urgency}>
            <option value="">Any urgency</option>
            {ISSUE_URGENCY_LEVELS.map((urgency) => (
              <option key={urgency.value} value={urgency.value}>
                {urgency.label}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect label="Date sort" name="sort" value={filters.sort}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </FilterSelect>

          <div className="flex items-end gap-2">
            <Button className="w-full lg:w-auto" type="submit">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Apply
            </Button>
            <Link
              className={buttonVariants({ variant: "secondary" })}
              href="/issues"
            >
              Reset
            </Link>
          </div>
        </div>
      </form>

      {filters.near ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-3 text-sm">
          <span className="font-semibold text-[var(--accent-strong)]">
            Sorted by distance from your location
          </span>
          <Link
            className="inline-flex items-center gap-1 text-[var(--muted)] hover:text-[var(--foreground)]"
            href={buildPublicIssuesHref(filters, { near: undefined, page: 1 })}
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear location
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function FilterSelect({
  children,
  label,
  name,
  value,
}: {
  children: ReactNode;
  label: string;
  name: string;
  value: string | undefined;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold">{label}</span>
      <Select defaultValue={value || ""} name={name}>
        {children}
      </Select>
    </label>
  );
}
