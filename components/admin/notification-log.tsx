import { BellRing } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";
import type { Tables } from "@/lib/types/database";

type NotificationStatusVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export function NotificationLog({
  notifications,
}: {
  notifications: Tables<"notifications">[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification log</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <article
                className="rounded-lg border border-[var(--line)] bg-white p-4"
                key={notification.id}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <BellRing
                    className="size-4 text-[var(--accent-strong)]"
                    aria-hidden="true"
                  />
                  <Badge
                    variant={getNotificationStatusVariant(notification.status)}
                  >
                    {notification.status}
                  </Badge>
                  <span className="text-sm text-[var(--muted)]">
                    {notification.channel} / {notification.event_type}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  Created {formatDateTime(notification.created_at)}
                  {notification.sent_at
                    ? `, sent ${formatDateTime(notification.sent_at)}`
                    : ""}
                </p>
                {notification.error_message ? (
                  <p className="mt-3 text-sm leading-6 text-[#9d3f29]">
                    {notification.error_message}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--muted)]">
            No Discord notification attempts have been logged for this issue.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function getNotificationStatusVariant(
  status: string,
): NotificationStatusVariant {
  switch (status) {
    case "sent":
      return "success";
    case "failed":
      return "danger";
    case "skipped":
      return "neutral";
    default:
      return "warning";
  }
}
