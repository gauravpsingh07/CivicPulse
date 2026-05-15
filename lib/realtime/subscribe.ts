"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { RealtimeIndicatorStatus } from "@/components/realtime/realtime-indicator";

export type IssueChangeScope = "public-map" | "admin-list" | "issue-detail";

export type IssueRealtimePayload = {
  eventType: string;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

export type SubscribeToIssueChangesOptions = {
  channelName: string;
  issueId?: string;
  onIssueChange?: (payload: IssueRealtimePayload) => void;
  onRelatedIssueChange?: () => void;
  onStatusChange?: (status: RealtimeIndicatorStatus) => void;
  scope: IssueChangeScope;
};

export function subscribeToIssueChanges({
  channelName,
  issueId,
  onIssueChange,
  onRelatedIssueChange,
  onStatusChange,
  scope,
}: SubscribeToIssueChangesOptions) {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    onStatusChange?.("disabled");
    return () => undefined;
  }

  const channel = supabase.channel(channelName);

  if (scope === "public-map" || scope === "admin-list") {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "issues" },
      (payload) => {
        if (scope === "public-map") {
          onIssueChange?.(normalizePayload(payload));
        } else {
          onRelatedIssueChange?.();
        }
      },
    );
  }

  if (scope === "issue-detail" && issueId) {
    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          filter: `id=eq.${issueId}`,
          schema: "public",
          table: "issues",
        },
        () => onRelatedIssueChange?.(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          filter: `issue_id=eq.${issueId}`,
          schema: "public",
          table: "issue_status_history",
        },
        () => onRelatedIssueChange?.(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          filter: `issue_id=eq.${issueId}`,
          schema: "public",
          table: "issue_comments",
        },
        () => onRelatedIssueChange?.(),
      );
  }

  channel.subscribe((nextStatus) => {
    if (nextStatus === "SUBSCRIBED") {
      onStatusChange?.("connected");
    } else if (nextStatus === "CHANNEL_ERROR" || nextStatus === "TIMED_OUT") {
      onStatusChange?.("reconnecting");
    }
  });

  return () => {
    supabase.removeChannel(channel);
  };
}

function normalizePayload(payload: {
  eventType: string;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}): IssueRealtimePayload {
  return {
    eventType: payload.eventType,
    new: payload.new,
    old: payload.old,
  };
}
