"use client";

import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import {
  DEFAULT_MAP_CENTER,
  OPENSTREETMAP_ATTRIBUTION,
  OPENSTREETMAP_TILE_URL,
} from "@/lib/constants";

export type MapPickerValue = {
  latitude: number;
  longitude: number;
};

export function MapPicker({
  value,
  onChange,
}: {
  value: MapPickerValue;
  onChange: (value: MapPickerValue) => void;
}) {
  const center: LatLngTuple = [
    value.latitude || DEFAULT_MAP_CENTER.latitude,
    value.longitude || DEFAULT_MAP_CENTER.longitude,
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
      <MapContainer
        center={center}
        className="h-[360px] w-full"
        scrollWheelZoom
        zoom={DEFAULT_MAP_CENTER.zoom}
      >
        <TileLayer
          attribution={OPENSTREETMAP_ATTRIBUTION}
          url={OPENSTREETMAP_TILE_URL}
        />
        <MapClickHandler onChange={onChange} />
        <CircleMarker
          center={[value.latitude, value.longitude]}
          fillColor="#dd694c"
          fillOpacity={0.88}
          pathOptions={{ color: "#9d3f29", weight: 2 }}
          radius={10}
        />
      </MapContainer>
      <p className="border-t border-[var(--line)] px-4 py-3 text-xs leading-5 text-[var(--muted)]">
        Click the map to set report coordinates. OpenStreetMap attribution is
        shown in the map control.
      </p>
    </div>
  );
}

function MapClickHandler({
  onChange,
}: {
  onChange: (value: MapPickerValue) => void;
}) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });

  return null;
}
