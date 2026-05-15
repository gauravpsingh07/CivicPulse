"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
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

export function PublicIssueMap({ issues }: { issues: PublicMapIssueMarker[] }) {
  const derivedCenter = getPublicMapCenter(issues);
  const center: LatLngTuple = [
    derivedCenter?.latitude ?? DEFAULT_MAP_CENTER.latitude,
    derivedCenter?.longitude ?? DEFAULT_MAP_CENTER.longitude,
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
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
        {issues.map((issue) => {
          const markerStyle = getIssueMarkerStyle(issue);

          return (
            <CircleMarker
              center={[Number(issue.latitude), Number(issue.longitude)]}
              fillColor={markerStyle.fillColor}
              fillOpacity={0.88}
              key={issue.id}
              pathOptions={{
                color: markerStyle.strokeColor,
                weight: markerStyle.weight,
              }}
              radius={markerStyle.radius}
            >
              <Popup>
                <article className="min-w-56 space-y-2">
                  <h2 className="text-base font-semibold leading-5">
                    {issue.title}
                  </h2>
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
        })}
      </MapContainer>
      <p className="border-t border-[var(--line)] px-4 py-3 text-xs leading-5 text-[var(--muted)]">
        Map data is limited for free-tier performance. OpenStreetMap attribution
        is shown in the map control.
      </p>
    </div>
  );
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
