import { ArrowRight } from "lucide-react";
import { IssueStatusBadge } from "@/components/issues/issue-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";
import { getIssueStatusLabel } from "@/lib/issues/status";
import type { Tables } from "@/lib/types/database";

export function IssueTimeline({
  events,
}: {
  events: Tables<"issue_status_history">[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length ? (
          <ol className="space-y-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="rounded-lg border border-[var(--line)] bg-white p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {event.from_status ? (
                    <>
                      <span className="text-sm font-semibold">
                        {getIssueStatusLabel(event.from_status)}
                      </span>
                      <ArrowRight
                        className="size-4 text-[var(--muted)]"
                        aria-hidden="true"
                      />
                    </>
                  ) : null}
                  <IssueStatusBadge status={event.to_status} />
                </div>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {formatDateTime(event.created_at)}
                </p>
                {event.note ? (
                  <p className="mt-3 text-sm leading-6">{event.note}</p>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm leading-6 text-[var(--muted)]">
            No status timeline entries are available yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
