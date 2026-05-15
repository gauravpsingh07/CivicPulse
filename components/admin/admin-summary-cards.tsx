import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ListChecks,
  TimerReset,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminIssueSummary } from "@/lib/admin/data";

export function AdminSummaryCards({ summary }: { summary: AdminIssueSummary }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        icon={<AlertTriangle className="size-5" aria-hidden="true" />}
        label="Open issues"
        tone="warning"
        value={summary.openCount}
      />
      <SummaryCard
        icon={<Clock3 className="size-5" aria-hidden="true" />}
        label="In-progress issues"
        tone="default"
        value={summary.inProgressCount}
      />
      <SummaryCard
        icon={<CheckCircle2 className="size-5" aria-hidden="true" />}
        label="Resolved/closed"
        tone="success"
        value={summary.resolvedOrClosedCount}
      />
      <SummaryCard
        icon={<ListChecks className="size-5" aria-hidden="true" />}
        label="High/critical"
        tone="danger"
        value={summary.highPriorityCount}
      />
      <SummaryCard
        helper={`${summary.averageResolutionIssueCount} resolved`}
        icon={<TimerReset className="size-5" aria-hidden="true" />}
        label="Avg resolution"
        tone="success"
        value={summary.averageResolutionLabel}
      />
    </section>
  );
}

function SummaryCard({
  helper,
  icon,
  label,
  tone,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  helper?: string;
  tone: "default" | "success" | "warning" | "danger";
  value: number | string;
}) {
  const toneClass = {
    default: "text-[var(--blue)]",
    success: "text-[var(--accent-strong)]",
    warning: "text-[#8a5b0d]",
    danger: "text-[#9d3f29]",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <span
          className={`grid size-11 place-items-center rounded-md bg-[var(--surface-strong)] ${toneClass}`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm text-[var(--muted)]">{label}</p>
          <p
            className={`mt-1 text-2xl font-semibold leading-tight ${toneClass}`}
          >
            {value}
          </p>
          {helper ? (
            <p className="mt-1 text-xs text-[var(--muted)]">{helper}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
