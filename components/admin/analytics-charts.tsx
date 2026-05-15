"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsCount } from "@/lib/analytics/calculations";

const chartColors = [
  "#dd694c",
  "#3478a8",
  "#1f8a5b",
  "#d2942c",
  "#9d3f29",
  "#6f7780",
  "#7a5aa8",
  "#2d8f83",
];

export function StatusChart({ data }: { data: AnalyticsCount[] }) {
  return (
    <ChartCard title="Status distribution" data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3ded2" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((item, index) => (
              <Cell
                fill={chartColors[index % chartColors.length]}
                key={item.key}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CategoryChart({ data }: { data: AnalyticsCount[] }) {
  return (
    <ChartCard title="Category mix" data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3ded2" />
          <XAxis allowDecimals={false} tick={{ fontSize: 12 }} type="number" />
          <YAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            type="category"
            width={92}
          />
          <Tooltip />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((item, index) => (
              <Cell
                fill={chartColors[index % chartColors.length]}
                key={item.key}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function UrgencyChart({ data }: { data: AnalyticsCount[] }) {
  const activeData = data.filter((item) => item.count > 0);

  return (
    <ChartCard title="Urgency mix" data={data}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="48%"
            data={activeData}
            dataKey="count"
            innerRadius={54}
            nameKey="label"
            outerRadius={92}
            paddingAngle={3}
          >
            {activeData.map((item, index) => (
              <Cell
                fill={chartColors[index % chartColors.length]}
                key={item.key}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ChartCard({
  children,
  data,
  title,
}: {
  children: React.ReactNode;
  data: AnalyticsCount[];
  title: string;
}) {
  const hasData = data.some((item) => item.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-80 w-full">{children}</div>
        ) : (
          <div className="grid h-80 place-items-center rounded-lg border border-dashed border-[var(--line)] bg-white p-6 text-center">
            <p className="text-sm leading-6 text-[var(--muted)]">
              No issue data is available for this chart yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
