import Link from "next/link";
import { AlertCircle, MapPinned, RadioTower } from "lucide-react";
import { PublicIssueMapShell } from "@/components/map/public-issue-map-shell";
import { PublicMapFilters } from "@/components/map/public-map-filters";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicMapIssues } from "@/lib/issues/public";
import { getPublicMapStats, parsePublicMapFilters } from "@/lib/map/markers";

type MapPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MapPage({ searchParams }: MapPageProps) {
  const query = await searchParams;
  const filters = parsePublicMapFilters(query);
  const result = await getPublicMapIssues(filters);
  const stats = getPublicMapStats(result.issues);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <Badge variant="success">OpenStreetMap public view</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal">
              Public issue map
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Explore public, non-rejected reports on a free-tier-friendly
              Leaflet map. Filter markers by category, status, and urgency.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className={buttonVariants({ variant: "secondary", size: "lg" })}
              href="/issues"
            >
              View list
            </Link>
            <Link className={buttonVariants({ size: "lg" })} href="/issues/new">
              Report an issue
            </Link>
          </div>
        </section>

        <PublicMapFilters filters={filters} />

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

        {!result.isConfigured || result.errorMessage ? (
          <MapNotice
            message={result.errorMessage || "Unable to load public map data."}
            title={
              !result.isConfigured
                ? "Supabase setup needed"
                : "Unable to load map data"
            }
          />
        ) : null}

        {result.issues.length ? (
          <PublicIssueMapShell issues={result.issues} />
        ) : (
          <EmptyMapState />
        )}
      </div>
    </main>
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

  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <span className="grid size-11 place-items-center rounded-md bg-[var(--surface-strong)]">
          <RadioTower className={`size-5 ${toneClass}`} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm text-[var(--muted)]">{label}</p>
          <p className={`mt-1 text-3xl font-semibold ${toneClass}`}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MapNotice({ message, title }: { message: string; title: string }) {
  return (
    <Card>
      <CardContent className="flex gap-3 pt-6">
        <AlertCircle
          className="mt-0.5 size-5 text-[#9d3f29]"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyMapState() {
  return (
    <Card>
      <CardHeader>
        <div className="grid size-11 place-items-center rounded-md bg-[var(--surface-strong)] text-[var(--accent-strong)]">
          <MapPinned className="size-5" aria-hidden="true" />
        </div>
        <CardTitle className="mt-5">No public map markers found</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-[var(--muted)]">
          Try changing the filters, or run the Supabase seed data after setup to
          populate demo reports. Private and rejected issues are intentionally
          hidden from this public map.
        </p>
      </CardContent>
    </Card>
  );
}
