import Link from "next/link";
import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ISSUE_CATEGORIES, ISSUE_URGENCY_LEVELS } from "@/lib/constants";
import type { PublicIssueFilters } from "@/lib/issues/filters";
import { PUBLIC_ISSUE_STATUSES } from "@/lib/issues/status";

export function IssueFilters({ filters }: { filters: PublicIssueFilters }) {
  return (
    <form
      action="/issues"
      className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]"
    >
      <FilterSelect label="Status" name="status" value={filters.status}>
        <option value="">Any status</option>
        {PUBLIC_ISSUE_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect label="Category" name="category" value={filters.category}>
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
    </form>
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
