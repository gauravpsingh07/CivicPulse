"use client";

import { useEffect, useMemo, useState } from "react";
import { PublicIssueMapShell } from "@/components/map/public-issue-map-shell";
import { Card, CardContent } from "@/components/ui/card";
import {
  getPublicMapStats,
  type PublicMapFilters,
  type PublicMapIssueMarker,
} from "@/lib/map/markers";
import {
  applyPublicIssueRealtimeChange,
  type RealtimeIssueChange,
} from "@/lib/realtime/issue-merge";
import {
  subscribeToIssueChanges,
  type IssueRealtimePayload,
} from "@/lib/realtime/subscribe";
import {
  RealtimeIndicator,
  type RealtimeIndicatorStatus,
} from "./realtime-indicator";

export function PublicMapRealtime({
  filters,
  initialIssues,
}: {
  filters: PublicMapFilters;
  initialIssues: PublicMapIssueMarker[];
}) {
  const [issues, setIssues] = useState(initialIssues);
  const [status, setStatus] = useState<RealtimeIndicatorStatus>("connecting");
  const stats = useMemo(() => getPublicMapStats(issues), [issues]);

  useEffect(() => {
    return subscribeToIssueChanges({
      channelName: "public-map-issues",
      onIssueChange(payload) {
        const change = toRealtimeIssueChange(payload);

        if (!change) {
          return;
        }

        setIssues((currentIssues) =>
          applyPublicIssueRealtimeChange(currentIssues, change, filters),
        );
      },
      onStatusChange: setStatus,
      scope: "public-map",
    });
  }, [filters]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <RealtimeIndicator status={status} />
        <p className="text-sm leading-6 text-[var(--muted)]">
          This page subscribes only while the map is open. Public filters are
          re-applied before a marker is added, updated, or removed.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MapStatCard
          label="Visible issues"
          value={stats.visibleCount}
          tone="default"
        />
        <MapStatCard label="Open" value={stats.openCount} tone="warning" />
        <MapStatCard
          label="High or critical"
          value={stats.highPriorityCount}
          tone="danger"
        />
      </section>

      {issues.length ? (
        <PublicIssueMapShell issues={issues} />
      ) : (
        <EmptyRealtimeMapState />
      )}
    </section>
  );
}

function MapStatCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "default" | "warning" | "danger";
  value: number;
}) {
  const toneClass = {
    default: "text-[var(--accent-strong)]",
    warning: "text-[#8a5b0d]",
    danger: "text-[#9d3f29]",
  }[tone];
  const dotClass = {
    default: "bg-[var(--accent-strong)]",
    warning: "bg-[#8a5b0d]",
    danger: "bg-[#9d3f29]",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <span className="grid size-11 place-items-center rounded-md bg-[var(--surface-strong)]">
          <span className={`size-3 rounded-full ${dotClass}`} />
        </span>
        <div>
          <p className="text-sm text-[var(--muted)]">{label}</p>
          <p className={`mt-1 text-3xl font-semibold ${toneClass}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyRealtimeMapState() {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm leading-6 text-[var(--muted)]">
          No public markers match the current filters. Private and rejected
          issues are intentionally hidden from this map.
        </p>
      </CardContent>
    </Card>
  );
}

function toRealtimeIssueChange(
  payload: IssueRealtimePayload,
): RealtimeIssueChange | null {
  if (payload.eventType === "DELETE") {
    const oldIssueId = getString(payload.old.id);

    return oldIssueId ? { eventType: "DELETE", oldIssueId } : null;
  }

  const issue = toIssueMarker(payload.new);

  if (!issue) {
    return null;
  }

  return {
    eventType: payload.eventType === "INSERT" ? "INSERT" : "UPDATE",
    issue,
  };
}

function toIssueMarker(row: Record<string, unknown>) {
  const id = getString(row.id);
  const title = getString(row.title);
  const category = getString(row.category);
  const urgency = getString(row.urgency);
  const status = getString(row.status);
  const latitude = getNumber(row.latitude);
  const longitude = getNumber(row.longitude);
  const createdAt = getString(row.created_at);

  if (
    !id ||
    !title ||
    !category ||
    !urgency ||
    !status ||
    latitude === null ||
    longitude === null ||
    !createdAt
  ) {
    return null;
  }

  return {
    id,
    title,
    category,
    urgency,
    status,
    latitude,
    longitude,
    address_label: getString(row.address_label),
    created_at: createdAt,
    upvote_count: getNumber(row.upvote_count) ?? 0,
    is_public: row.is_public !== false,
  } as PublicMapIssueMarker & { is_public?: boolean };
}

function getString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function getNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}
