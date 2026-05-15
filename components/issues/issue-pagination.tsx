import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  buildPublicIssuesHref,
  type PublicIssueFilters,
} from "@/lib/issues/filters";
import { cn } from "@/lib/utils";

export function IssuePagination({
  filters,
  pageCount,
  totalCount,
}: {
  filters: PublicIssueFilters;
  pageCount: number;
  totalCount: number;
}) {
  if (pageCount <= 1) {
    return null;
  }

  const previousPage = Math.max(1, filters.page - 1);
  const nextPage = Math.min(pageCount, filters.page + 1);

  return (
    <nav
      aria-label="Issue pagination"
      className="flex flex-col items-start justify-between gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center"
    >
      <p className="text-sm text-[var(--muted)]">
        Page {filters.page} of {pageCount}, {totalCount} public issues
      </p>
      <div className="flex gap-2">
        <PaginationLink
          disabled={filters.page <= 1}
          href={buildPublicIssuesHref(filters, { page: previousPage })}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </PaginationLink>
        <PaginationLink
          disabled={filters.page >= pageCount}
          href={buildPublicIssuesHref(filters, { page: nextPage })}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </PaginationLink>
      </div>
    </nav>
  );
}

function PaginationLink({
  children,
  disabled,
  href,
}: {
  children: ReactNode;
  disabled: boolean;
  href: string;
}) {
  return (
    <Link
      aria-disabled={disabled}
      className={cn(
        buttonVariants({ variant: "secondary" }),
        disabled && "pointer-events-none opacity-50",
      )}
      href={href}
    >
      {children}
    </Link>
  );
}
