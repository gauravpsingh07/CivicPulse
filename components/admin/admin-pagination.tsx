import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  buildAdminIssuesHref,
  type AdminIssueFilters,
} from "@/lib/admin/filters";
import { cn } from "@/lib/utils";

export function AdminPagination({
  filters,
  pageCount,
  totalCount,
}: {
  filters: AdminIssueFilters;
  pageCount: number;
  totalCount: number;
}) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Admin issue pagination"
      className="flex flex-col items-start justify-between gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center"
    >
      <p className="text-sm text-[var(--muted)]">
        Page {filters.page} of {pageCount}, {totalCount} total issues
      </p>
      <div className="flex gap-2">
        <PaginationLink
          disabled={filters.page <= 1}
          href={buildAdminIssuesHref(filters, {
            page: Math.max(1, filters.page - 1),
          })}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </PaginationLink>
        <PaginationLink
          disabled={filters.page >= pageCount}
          href={buildAdminIssuesHref(filters, {
            page: Math.min(pageCount, filters.page + 1),
          })}
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
  children: React.ReactNode;
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
