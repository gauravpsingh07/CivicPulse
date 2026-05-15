import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import {
  IssueStatusBadge,
  IssueUrgencyBadge,
} from "@/components/issues/issue-status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateOnly } from "@/lib/dates";
import { getIssueCategoryLabel } from "@/lib/issues/status";
import type { AdminIssue } from "@/lib/admin/data";

export function AdminIssueTable({ issues }: { issues: AdminIssue[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation queue</CardTitle>
      </CardHeader>
      <CardContent>
        {issues.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <th className="py-3 pr-4">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Urgency</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="py-3 pl-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr
                    className="border-b border-[var(--line)] align-top last:border-0"
                    key={issue.id}
                  >
                    <td className="max-w-xs py-4 pr-4">
                      <Link
                        className="font-semibold hover:text-[var(--accent-strong)]"
                        href={`/admin/issues/${issue.id}`}
                      >
                        {issue.title}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                        {issue.description}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="neutral">
                        {getIssueCategoryLabel(issue.category)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <IssueUrgencyBadge urgency={issue.urgency} />
                    </td>
                    <td className="px-4 py-4">
                      <IssueStatusBadge status={issue.status} />
                    </td>
                    <td className="px-4 py-4 text-[var(--muted)]">
                      {issue.reporter?.full_name ||
                        issue.reporter_id ||
                        "Demo seed"}
                    </td>
                    <td className="px-4 py-4 text-[var(--muted)]">
                      {formatDateOnly(issue.created_at)}
                    </td>
                    <td className="px-4 py-4 text-[var(--muted)]">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="size-4" aria-hidden="true" />
                        {issue.address_label ||
                          `${Number(issue.latitude).toFixed(4)}, ${Number(issue.longitude).toFixed(4)}`}
                      </span>
                    </td>
                    <td className="py-4 pl-4">
                      <Link
                        className={buttonVariants({
                          variant: "secondary",
                          size: "sm",
                        })}
                        href={`/admin/issues/${issue.id}`}
                      >
                        <ExternalLink className="size-4" aria-hidden="true" />
                        Moderate
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--muted)]">
            No issues match the current admin filters.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
