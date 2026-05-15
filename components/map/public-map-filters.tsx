import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ISSUE_CATEGORIES, ISSUE_URGENCY_LEVELS } from "@/lib/constants";
import { PUBLIC_ISSUE_STATUSES } from "@/lib/issues/status";
import type { PublicMapFilters } from "@/lib/map/markers";

export function PublicMapFilters({ filters }: { filters: PublicMapFilters }) {
  return (
    <form
      action="/map"
      className="grid gap-4 rounded-lg border border-[var(--line)] bg-white p-4 md:grid-cols-2 xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
    >
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Status</span>
        <Select defaultValue={filters.status || ""} name="status">
          <option value="">Any status</option>
          {PUBLIC_ISSUE_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold">Category</span>
        <Select defaultValue={filters.category || ""} name="category">
          <option value="">Any category</option>
          {ISSUE_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </Select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold">Urgency</span>
        <Select defaultValue={filters.urgency || ""} name="urgency">
          <option value="">Any urgency</option>
          {ISSUE_URGENCY_LEVELS.map((urgency) => (
            <option key={urgency.value} value={urgency.value}>
              {urgency.label}
            </option>
          ))}
        </Select>
      </label>

      <div className="flex items-end gap-2 md:col-span-2 xl:col-span-1">
        <Button className="w-full xl:w-auto" type="submit">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Apply
        </Button>
        <Link className={buttonVariants({ variant: "secondary" })} href="/map">
          Reset
        </Link>
      </div>
    </form>
  );
}
