"use client";

import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import {
  OPENSTREETMAP_ATTRIBUTION,
  OPENSTREETMAP_TILE_URL,
} from "@/lib/constants";

export function IssueMapPreview({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const center: LatLngTuple = [latitude, longitude];

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
      <MapContainer
        center={center}
        className="h-[300px] w-full"
        dragging={false}
        scrollWheelZoom={false}
        zoom={15}
      >
        <TileLayer
          attribution={OPENSTREETMAP_ATTRIBUTION}
          url={OPENSTREETMAP_TILE_URL}
        />
        <CircleMarker
          center={center}
          fillColor="#dd694c"
          fillOpacity={0.88}
          pathOptions={{ color: "#9d3f29", weight: 2 }}
          radius={10}
        />
      </MapContainer>
    </div>
  );
}
