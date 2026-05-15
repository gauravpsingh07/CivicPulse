import { AlertTriangle, CheckCircle2, Clock3, ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AdminIssueSummary } from "@/lib/admin/data";

export function AdminSummaryCards({ summary }: { summary: AdminIssueSummary }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        icon={<AlertTriangle className="size-5" aria-hidden="true" />}
        label="Open"
        tone="warning"
        value={summary.openCount}
      />
      <SummaryCard
        icon={<Clock3 className="size-5" aria-hidden="true" />}
        label="In progress"
        tone="default"
        value={summary.inProgressCount}
      />
      <SummaryCard
        icon={<CheckCircle2 className="size-5" aria-hidden="true" />}
        label="Resolved or closed"
        tone="success"
        value={summary.resolvedOrClosedCount}
      />
      <SummaryCard
        icon={<ListChecks className="size-5" aria-hidden="true" />}
        label="High or critical"
        tone="danger"
        value={summary.highPriorityCount}
      />
    </section>
  );
}

function SummaryCard({
  icon,
  label,
  tone,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "default" | "success" | "warning" | "danger";
  value: number;
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
        <div>
          <p className="text-sm text-[var(--muted)]">{label}</p>
          <p className={`mt-1 text-3xl font-semibold ${toneClass}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
