"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Search } from "lucide-react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DEFAULT_MAP_CENTER,
  OPENSTREETMAP_ATTRIBUTION,
  OPENSTREETMAP_TILE_URL,
} from "@/lib/constants";
import type { GeocodingResult } from "@/lib/geocoding/nominatim";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTarget, setSearchTarget] = useState<MapPickerValue | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [searchTone, setSearchTone] = useState<"success" | "error">("success");
  const [isSearching, setIsSearching] = useState(false);
  const center: LatLngTuple = [
    value.latitude || DEFAULT_MAP_CENTER.latitude,
    value.longitude || DEFAULT_MAP_CENTER.longitude,
  ];

  async function searchArea() {
    const query = searchQuery.trim();

    if (!query) {
      setSearchTone("error");
      setSearchMessage(
        "No matching location found. Try a more specific address, landmark, or ZIP code.",
      );
      return;
    }

    setIsSearching(true);
    setSearchMessage(null);

    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const data = (await response.json()) as {
        results?: GeocodingResult[];
      };
      const result = data.results?.[0];

      if (!result) {
        setSearchTone("error");
        setSearchMessage(
          "No matching location found. Try a more specific address, landmark, or ZIP code.",
        );
        return;
      }

      setSearchTarget({
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setSearchTone("success");
      setSearchMessage(
        "Map moved to the searched area. Click the exact issue location to confirm.",
      );
    } catch {
      setSearchTone("error");
      setSearchMessage(
        "Location search is unavailable right now. You can still move the map manually and click the issue location.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
      <div className="space-y-3 border-b border-[var(--line)] p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex-1 space-y-2">
            <span className="text-sm font-semibold">Find the area</span>
            <Input
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void searchArea();
                }
              }}
              placeholder="Search address, landmark, street, or ZIP code"
              type="search"
              value={searchQuery}
            />
          </label>
          <Button
            className="sm:mt-7"
            disabled={isSearching}
            onClick={() => void searchArea()}
            type="button"
            variant="secondary"
          >
            <Search className="size-4" aria-hidden="true" />
            {isSearching ? "Searching..." : "Search area"}
          </Button>
        </div>
        <p className="text-xs leading-5 text-[var(--muted)]">
          Search to move the map near the area, then click the exact issue
          location.
        </p>
        {searchMessage ? (
          <p
            className={`flex items-start gap-2 text-sm ${
              searchTone === "success"
                ? "text-[var(--accent-strong)]"
                : "text-[#9d3f29]"
            }`}
          >
            {searchTone === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4" aria-hidden="true" />
            ) : (
              <AlertTriangle className="mt-0.5 size-4" aria-hidden="true" />
            )}
            {searchMessage}
          </p>
        ) : null}
      </div>
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
        <MapSearchTarget target={searchTarget} />
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

function MapSearchTarget({ target }: { target: MapPickerValue | null }) {
  const map = useMap();

  useEffect(() => {
    if (!target) {
      return;
    }

    map.setView([target.latitude, target.longitude], 15);
  }, [map, target]);

  return null;
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
