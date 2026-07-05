"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CopyCheck, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceLabel } from "@/lib/geo";
import { getIssueStatusLabel } from "@/lib/issues/status";
import type { IssueCategory, IssueStatus } from "@/lib/types";

type NearbySuggestion = {
  id: string;
  title: string;
  status: IssueStatus;
  category: IssueCategory;
  upvote_count: number;
  distance_meters: number;
};

const LOOKUP_DEBOUNCE_MS = 700;

export function NearbyDuplicates({
  latitude,
  longitude,
  category,
}: {
  latitude: number;
  longitude: number;
  category: string;
}) {
  const [suggestions, setSuggestions] = useState<NearbySuggestion[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setSuggestions([]);
        return;
      }

      try {
        const params = new URLSearchParams({
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
        });

        if (category) {
          params.set("category", category);
        }

        const response = await fetch(`/api/issues/nearby?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const data = (await response.json()) as {
          results?: NearbySuggestion[];
        };

        setSuggestions(data.results ?? []);
      } catch {
        // Silently skip suggestions when the lookup fails — submitting a
        // possible duplicate is still allowed.
        setSuggestions([]);
      }
    }, LOOKUP_DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [latitude, longitude, category]);

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-strong)] p-4">
      <div className="flex items-center gap-2">
        <CopyCheck
          className="size-4 text-[var(--accent-strong)]"
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold">
          Possible existing reports near this location
        </h3>
      </div>
      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
        If one of these matches your issue, open it and tap &quot;I&apos;m also
        affected&quot; instead of filing a duplicate.
      </p>
      <ul className="mt-3 space-y-2">
        {suggestions.map((suggestion) => (
          <li key={suggestion.id}>
            <Link
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm hover:bg-[var(--surface-strong)]"
              href={`/issues/${suggestion.id}`}
              target="_blank"
            >
              <span className="font-semibold">{suggestion.title}</span>
              <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <Badge variant="neutral">
                  {getIssueStatusLabel(suggestion.status)}
                </Badge>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="size-3" aria-hidden="true" />
                  {suggestion.upvote_count}
                </span>
                {formatDistanceLabel(suggestion.distance_meters)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
