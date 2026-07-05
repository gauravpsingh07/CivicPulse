"use client";

import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet.heat";
import Supercluster from "supercluster";
import { Flame, MapPin } from "lucide-react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_MAP_CENTER,
  OPENSTREETMAP_ATTRIBUTION,
  OPENSTREETMAP_TILE_URL,
} from "@/lib/constants";
import { formatDateOnly } from "@/lib/dates";
import {
  getIssueCategoryLabel,
  getIssueStatusLabel,
  getIssueUrgencyLabel,
} from "@/lib/issues/status";
import {
  getIssueMarkerStyle,
  getPublicMapCenter,
  type PublicMapIssueMarker,
} from "@/lib/map/markers";

type MapViewMode = "markers" | "heatmap";

export function PublicIssueMap({ issues }: { issues: PublicMapIssueMarker[] }) {
  const [viewMode, setViewMode] = useState<MapViewMode>("markers");
  const derivedCenter = getPublicMapCenter(issues);
  const center: LatLngTuple = [
    derivedCenter?.latitude ?? DEFAULT_MAP_CENTER.latitude,
    derivedCenter?.longitude ?? DEFAULT_MAP_CENTER.longitude,
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] p-3">
        <Button
          onClick={() => setViewMode("markers")}
          size="sm"
          type="button"
          variant={viewMode === "markers" ? "primary" : "secondary"}
        >
          <MapPin className="size-4" aria-hidden="true" />
          Markers
        </Button>
        <Button
          onClick={() => setViewMode("heatmap")}
          size="sm"
          type="button"
          variant={viewMode === "heatmap" ? "primary" : "secondary"}
        >
          <Flame className="size-4" aria-hidden="true" />
          Heatmap
        </Button>
        <p className="ml-auto text-xs leading-5 text-[var(--muted)]">
          {viewMode === "markers"
            ? "Nearby reports group into clusters — click a cluster to zoom in."
            : "Warmer areas have more (and more urgent) reports."}
        </p>
      </div>
      <MapContainer
        center={center}
        className="h-[62vh] min-h-[420px] w-full"
        maxZoom={18}
        scrollWheelZoom
        zoom={issues.length === 1 ? 15 : DEFAULT_MAP_CENTER.zoom}
      >
        <TileLayer
          attribution={OPENSTREETMAP_ATTRIBUTION}
          url={OPENSTREETMAP_TILE_URL}
        />
        <FitIssueBounds issues={issues} />
        {viewMode === "markers" ? (
          <ClusteredIssueMarkers issues={issues} />
        ) : (
          <IssueHeatLayer issues={issues} />
        )}
      </MapContainer>
      <p className="border-t border-[var(--line)] px-4 py-3 text-xs leading-5 text-[var(--muted)]">
        Map data is limited for free-tier performance. OpenStreetMap attribution
        is shown in the map control.
      </p>
    </div>
  );
}

function ClusteredIssueMarkers({
  issues,
}: {
  issues: PublicMapIssueMarker[];
}) {
  const map = useMap();
  const [viewport, setViewport] = useState(() => ({
    bounds: map.getBounds(),
    zoom: map.getZoom(),
  }));

  useMapEvents({
    moveend: () => setViewport({ bounds: map.getBounds(), zoom: map.getZoom() }),
    zoomend: () => setViewport({ bounds: map.getBounds(), zoom: map.getZoom() }),
  });

  const clusterIndex = useMemo(() => {
    const index = new Supercluster<{ issue: PublicMapIssueMarker }>({
      maxZoom: 16,
      radius: 64,
    });

    index.load(
      issues
        .filter(
          (issue) =>
            Number.isFinite(Number(issue.latitude)) &&
            Number.isFinite(Number(issue.longitude)),
        )
        .map((issue) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [Number(issue.longitude), Number(issue.latitude)],
          },
          properties: { issue },
        })),
    );

    return index;
  }, [issues]);

  const clusters = useMemo(() => {
    const bounds = viewport.bounds;

    return clusterIndex.getClusters(
      [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      Math.round(viewport.zoom),
    );
  }, [clusterIndex, viewport]);

  return (
    <>
      {clusters.map((feature) => {
        const [longitude, latitude] = feature.geometry.coordinates;

        if (feature.properties && "cluster" in feature.properties) {
          const clusterId = feature.id as number;
          const count = feature.properties.point_count as number;

          return (
            <Marker
              eventHandlers={{
                click: () => {
                  map.setView(
                    [latitude, longitude],
                    Math.min(clusterIndex.getClusterExpansionZoom(clusterId), 18),
                  );
                },
              }}
              icon={createClusterIcon(count)}
              key={`cluster-${clusterId}`}
              position={[latitude, longitude]}
            />
          );
        }

        const issue = (feature.properties as { issue: PublicMapIssueMarker })
          .issue;

        return <SingleIssueMarker issue={issue} key={issue.id} />;
      })}
    </>
  );
}

function SingleIssueMarker({ issue }: { issue: PublicMapIssueMarker }) {
  const markerStyle = getIssueMarkerStyle(issue);

  return (
    <CircleMarker
      center={[Number(issue.latitude), Number(issue.longitude)]}
      fillColor={markerStyle.fillColor}
      fillOpacity={0.88}
      pathOptions={{
        color: markerStyle.strokeColor,
        weight: markerStyle.weight,
      }}
      radius={markerStyle.radius}
    >
      <Popup>
        <article className="min-w-56 space-y-2">
          <h2 className="text-base font-semibold leading-5">{issue.title}</h2>
          <dl className="grid gap-1 text-sm">
            <PopupRow
              label="Category"
              value={getIssueCategoryLabel(issue.category)}
            />
            <PopupRow
              label="Status"
              value={getIssueStatusLabel(issue.status)}
            />
            <PopupRow
              label="Urgency"
              value={getIssueUrgencyLabel(issue.urgency)}
            />
            <PopupRow
              label="Affected"
              value={`${issue.upvote_count ?? 0} resident${(issue.upvote_count ?? 0) === 1 ? "" : "s"}`}
            />
            <PopupRow
              label="Created"
              value={formatDateOnly(issue.created_at)}
            />
          </dl>
          <a
            className="inline-flex font-semibold text-[var(--accent-strong)]"
            href={`/issues/${issue.id}`}
          >
            View Details
          </a>
        </article>
      </Popup>
    </CircleMarker>
  );
}

function IssueHeatLayer({ issues }: { issues: PublicMapIssueMarker[] }) {
  const map = useMap();

  useEffect(() => {
    const points = issues
      .filter(
        (issue) =>
          Number.isFinite(Number(issue.latitude)) &&
          Number.isFinite(Number(issue.longitude)),
      )
      .map(
        (issue) =>
          [
            Number(issue.latitude),
            Number(issue.longitude),
            getHeatWeight(issue),
          ] as [number, number, number],
      );

    const layer = L.heatLayer(points, {
      blur: 24,
      maxZoom: 17,
      radius: 34,
    });

    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [issues, map]);

  return null;
}

function getHeatWeight(issue: PublicMapIssueMarker) {
  switch (issue.urgency) {
    case "critical":
      return 1;
    case "high":
      return 0.75;
    case "medium":
      return 0.5;
    default:
      return 0.3;
  }
}

function createClusterIcon(count: number) {
  const size = count >= 100 ? 52 : count >= 10 ? 44 : 38;

  return L.divIcon({
    className: "cluster-marker",
    html: `<div class="cluster-badge">${count}</div>`,
    iconSize: [size, size],
  });
}

function PopupRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-2">
      <dt className="font-semibold">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function FitIssueBounds({ issues }: { issues: PublicMapIssueMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (!issues.length) {
      map.setView(
        [DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude],
        DEFAULT_MAP_CENTER.zoom,
      );
      return;
    }

    if (issues.length === 1) {
      map.setView(
        [Number(issues[0].latitude), Number(issues[0].longitude)],
        15,
      );
      return;
    }

    const bounds: LatLngBoundsExpression = issues.map((issue) => [
      Number(issue.latitude),
      Number(issue.longitude),
    ]);

    map.fitBounds(bounds, {
      maxZoom: 14,
      padding: [36, 36],
    });
  }, [issues, map]);

  return null;
}
