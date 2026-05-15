import Link from "next/link";
import { ArrowRight, History } from "lucide-react";
import { IssueStatusBadge } from "@/components/issues/issue-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";
import { getIssueStatusLabel } from "@/lib/issues/status";
import type { RecentActivityItem } from "@/lib/admin/analytics";

export function RecentActivityFeed({
  activity,
}: {
  activity: RecentActivityItem[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length ? (
          <ol className="space-y-4">
            {activity.map((item) => (
              <li
                className="rounded-lg border border-[var(--line)] bg-white p-4"
                key={item.id}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <History
                    className="size-4 text-[var(--accent-strong)]"
                    aria-hidden="true"
                  />
                  <Link
                    className="font-semibold text-[var(--accent-strong)]"
                    href={`/admin/issues/${item.issueId}`}
                  >
                    {item.issueTitle}
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {item.fromStatus ? (
                    <>
                      <span className="text-sm font-semibold">
                        {getIssueStatusLabel(item.fromStatus)}
                      </span>
                      <ArrowRight
                        className="size-4 text-[var(--muted)]"
                        aria-hidden="true"
                      />
                    </>
                  ) : null}
                  <IssueStatusBadge status={item.toStatus} />
                </div>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {formatDateTime(item.createdAt)} by {item.changedBy}
                </p>
                {item.note ? (
                  <p className="mt-3 text-sm leading-6">{item.note}</p>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm leading-6 text-[var(--muted)]">
            No status activity has been recorded yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
