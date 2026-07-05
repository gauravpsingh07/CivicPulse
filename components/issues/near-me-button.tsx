"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildPublicIssuesHref,
  type PublicIssueFilters,
} from "@/lib/issues/filters";

export function NearMeButton({ filters }: { filters: PublicIssueFilters }) {
  const router = useRouter();
  const [isLocating, setIsLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function locate() {
    if (!("geolocation" in navigator)) {
      setMessage("Location is not available in this browser.");
      return;
    }

    setIsLocating(true);
    setMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        router.push(
          buildPublicIssuesHref(filters, {
            near: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            page: 1,
          }),
        );
      },
      () => {
        setIsLocating(false);
        setMessage(
          "Location permission was denied. You can still browse and filter the list.",
        );
      },
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-1">
      <Button
        disabled={isLocating}
        onClick={locate}
        type="button"
        variant="secondary"
      >
        <LocateFixed className="size-4" aria-hidden="true" />
        {isLocating ? "Locating..." : "Issues near me"}
      </Button>
      {message ? (
        <p className="text-xs leading-5 text-[#9d3f29]">{message}</p>
      ) : null}
    </div>
  );
}
