import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { PublicMapFilters } from "@/components/map/public-map-filters";
import { PublicMapRealtime } from "@/components/realtime/public-map-realtime";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublicMapIssues } from "@/lib/issues/public";
import { parsePublicMapFilters } from "@/lib/map/markers";

type MapPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MapPage({ searchParams }: MapPageProps) {
  const query = await searchParams;
  const filters = parsePublicMapFilters(query);
  const result = await getPublicMapIssues(filters);

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

        <PublicMapRealtime
          key={getMapRealtimeKey(filters)}
          filters={filters}
          initialIssues={result.issues}
        />
      </div>
    </main>
  );
}

function getMapRealtimeKey(filters: ReturnType<typeof parsePublicMapFilters>) {
  return [
    filters.status || "any-status",
    filters.category || "any-category",
    filters.urgency || "any-urgency",
  ].join(":");
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
