import {
  CategoryChart,
  StatusChart,
  UrgencyChart,
} from "@/components/admin/analytics-charts";
import { RecentActivityFeed } from "@/components/admin/recent-activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminAnalyticsDashboard } from "@/lib/admin/analytics";

export function AdminAnalyticsSection({
  analytics,
}: {
  analytics: AdminAnalyticsDashboard;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">
          Analytics overview
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Counts are loaded through the server-protected admin route.
        </p>
      </div>

      {analytics.errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Analytics unavailable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-[var(--muted)]">
              {analytics.errorMessage}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <StatusChart data={analytics.statusCounts} />
        <UrgencyChart data={analytics.urgencyCounts} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <CategoryChart data={analytics.categoryCounts} />
        <RecentActivityFeed activity={analytics.recentActivity} />
      </div>
    </section>
  );
}
