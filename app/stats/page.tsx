import Link from "next/link";
import { AlertCircle, BarChart3, Clock3, ListChecks } from "lucide-react";
import { PublicStatsCharts } from "@/components/stats/public-stats-charts";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicAnalytics } from "@/lib/issues/public";

export const metadata = {
  title: "Community statistics | CivicPulse",
  description:
    "Public statistics for community-reported issues: volume, categories, urgency, and resolution times.",
};

export default async function StatsPage() {
  const analytics = await getPublicAnalytics();
  const activeCount = analytics.statusCounts
    .filter((item) => item.key === "open" || item.key === "in_progress")
    .reduce((total, item) => total + item.count, 0);
  const resolvedCount = analytics.statusCounts
    .filter((item) => item.key === "resolved" || item.key === "closed")
    .reduce((total, item) => total + item.count, 0);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <Badge variant="success">Public data only</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal">
              Community statistics
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Live aggregates computed from public, non-rejected reports.
              Private reports and moderation internals are excluded.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className={buttonVariants({ variant: "secondary", size: "lg" })}
              href="/map"
            >
              View map
            </Link>
            <Link className={buttonVariants({ size: "lg" })} href="/issues">
              Browse issues
            </Link>
          </div>
        </section>

        {analytics.errorMessage ? (
          <Card>
            <CardContent className="flex gap-3 pt-6">
              <AlertCircle
                className="mt-0.5 size-5 text-[#9d3f29]"
                aria-hidden="true"
              />
              <div>
                <h2 className="font-semibold">
                  {analytics.isConfigured
                    ? "Unable to load statistics"
                    : "Supabase setup needed"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                  {analytics.errorMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard
                icon={<BarChart3 className="size-5" aria-hidden="true" />}
                label="Public issues"
                value={analytics.totalPublicIssues.toString()}
              />
              <StatCard
                icon={<ListChecks className="size-5" aria-hidden="true" />}
                label="Active reports"
                value={activeCount.toString()}
              />
              <StatCard
                icon={<ListChecks className="size-5" aria-hidden="true" />}
                label="Resolved or closed"
                value={resolvedCount.toString()}
              />
              <StatCard
                icon={<Clock3 className="size-5" aria-hidden="true" />}
                label="Avg. resolution time"
                value={analytics.averageResolutionTime.label}
              />
            </section>

            <PublicStatsCharts
              categoryCounts={analytics.categoryCounts}
              monthlyCounts={analytics.monthlyCounts}
              statusCounts={analytics.statusCounts}
              urgencyCounts={analytics.urgencyCounts}
            />
          </>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <span className="grid size-11 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--accent-strong)]">
          {icon}
        </span>
        <div>
          <p className="text-sm text-[var(--muted)]">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
