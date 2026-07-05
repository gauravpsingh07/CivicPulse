"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CategoryChart,
  StatusChart,
  UrgencyChart,
} from "@/components/admin/analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AnalyticsCount,
  MonthlyCount,
} from "@/lib/analytics/calculations";

export function PublicStatsCharts({
  statusCounts,
  categoryCounts,
  urgencyCounts,
  monthlyCounts,
}: {
  statusCounts: AnalyticsCount[];
  categoryCounts: AnalyticsCount[];
  urgencyCounts: AnalyticsCount[];
  monthlyCounts: MonthlyCount[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <MonthlyTrendChart data={monthlyCounts} />
      <StatusChart data={statusCounts} />
      <CategoryChart data={categoryCounts} />
      <UrgencyChart data={urgencyCounts} />
    </div>
  );
}

function MonthlyTrendChart({ data }: { data: MonthlyCount[] }) {
  const hasData = data.some((item) => item.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reports submitted per month</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3ded2" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1f8a5b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="grid h-80 place-items-center rounded-lg border border-dashed border-[var(--line)] bg-white p-6 text-center">
            <p className="text-sm leading-6 text-[var(--muted)]">
              No submissions in the last six months yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
