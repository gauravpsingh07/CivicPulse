"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  subscribeToIssueChanges,
  type IssueChangeScope,
} from "@/lib/realtime/subscribe";
import {
  RealtimeIndicator,
  type RealtimeIndicatorStatus,
} from "./realtime-indicator";

type RealtimeRefreshPromptProps = {
  channelName: string;
  description: string;
  issueId?: string;
  mode: Extract<IssueChangeScope, "admin-list" | "issue-detail">;
};

export function RealtimeRefreshPrompt({
  channelName,
  description,
  issueId,
  mode,
}: RealtimeRefreshPromptProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RealtimeIndicatorStatus>("connecting");
  const [changeCount, setChangeCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return subscribeToIssueChanges({
      channelName,
      issueId,
      onRelatedIssueChange: () => setChangeCount((count) => count + 1),
      onStatusChange: setStatus,
      scope: mode,
    });
  }, [channelName, issueId, mode]);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <RealtimeIndicator status={status} />
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {description}
          </p>
          {changeCount > 0 ? (
            <p className="mt-2 text-sm font-semibold text-[var(--accent-strong)]">
              {changeCount} live change{changeCount === 1 ? "" : "s"} ready to
              load.
            </p>
          ) : null}
        </div>
        <Button
          disabled={isPending || changeCount === 0}
          onClick={() => {
            startTransition(() => {
              router.refresh();
              setChangeCount(0);
            });
          }}
          type="button"
          variant="secondary"
        >
          <RotateCw className="size-4" aria-hidden="true" />
          {isPending ? "Refreshing..." : "Refresh"}
        </Button>
      </CardContent>
    </Card>
  );
}
