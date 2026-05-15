"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { useActionState, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Send, Upload } from "lucide-react";
import {
  ACCEPTED_IMAGE_TYPES,
  DEFAULT_MAP_CENTER,
  ISSUE_CATEGORIES,
  ISSUE_URGENCY_LEVELS,
} from "@/lib/constants";
import { createIssueAction } from "@/lib/actions/issues";
import {
  normalizeOptionalIssueImageFile,
  validateIssueImage,
} from "@/lib/images";
import { initialCreateIssueActionState } from "@/lib/issues/action-state";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { MapPickerValue } from "@/components/map/map-picker";

const MapPicker = dynamic(
  () =>
    import("@/components/map/map-picker").then((module) => module.MapPicker),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[420px] w-full" />,
  },
);

export function IssueForm() {
  const [state, formAction, isPending] = useActionState(
    createIssueAction,
    initialCreateIssueActionState,
  );
  const [coordinates, setCoordinates] = useState<MapPickerValue>({
    latitude: DEFAULT_MAP_CENTER.latitude,
    longitude: DEFAULT_MAP_CENTER.longitude,
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageMessage, setImageMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const acceptedTypes = useMemo(() => ACCEPTED_IMAGE_TYPES.join(","), []);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="success">Protected</Badge>
          <Badge variant="neutral">2 MB image limit</Badge>
        </div>
        <CardTitle className="mt-5 text-3xl">Submit a civic issue</CardTitle>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Create a public report with validated details, map coordinates, and an
          optional image. High and critical reports will attempt a server-side
          Discord alert when configured.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-8">
          <AuthErrorMessage
            tone={state.status === "partial" ? "info" : "error"}
            message={state.message}
          />
          {state.createdIssueId ? (
            <Link
              className="inline-flex text-sm font-semibold text-[var(--accent-strong)]"
              href={`/issues/${state.createdIssueId}`}
            >
              Open created issue
            </Link>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold">Title</span>
              <Input
                maxLength={120}
                minLength={5}
                name="title"
                placeholder="Large pothole near the library"
                required
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold">Description</span>
              <Textarea
                maxLength={2000}
                minLength={20}
                name="description"
                placeholder="Describe the issue, nearby landmarks, and any safety concerns."
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold">Category</span>
              <Select name="category" required>
                {ISSUE_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold">Urgency</span>
              <Select name="urgency" required>
                {ISSUE_URGENCY_LEVELS.map((urgency) => (
                  <option key={urgency.value} value={urgency.value}>
                    {urgency.label}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold">Address label</span>
              <Input
                maxLength={180}
                name="addressLabel"
                placeholder="Optional landmark or street corner"
              />
            </label>
          </div>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Location</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Click the map or fine-tune the coordinates manually.
              </p>
            </div>
            <MapPicker value={coordinates} onChange={setCoordinates} />
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Latitude</span>
                <Input
                  max={90}
                  min={-90}
                  name="latitude"
                  onChange={(event) =>
                    setCoordinates((current) => ({
                      ...current,
                      latitude: Number(event.target.value),
                    }))
                  }
                  required
                  step="0.000001"
                  type="number"
                  value={coordinates.latitude}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Longitude</span>
                <Input
                  max={180}
                  min={-180}
                  name="longitude"
                  onChange={(event) =>
                    setCoordinates((current) => ({
                      ...current,
                      longitude: Number(event.target.value),
                    }))
                  }
                  required
                  step="0.000001"
                  type="number"
                  value={coordinates.longitude}
                />
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Image</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                Optional JPEG, PNG, or WebP image. The file is uploaded to
                Supabase Storage and only the storage path is saved in
                PostgreSQL.
              </p>
            </div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--line)] bg-white px-5 py-8 text-center hover:bg-[var(--surface-strong)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--accent-strong)]">
              <Upload
                className="size-7 text-[var(--accent-strong)]"
                aria-hidden="true"
              />
              <span className="mt-3 text-sm font-semibold">Choose image</span>
              <span className="mt-1 text-xs text-[var(--muted)]">
                JPEG, PNG, WebP. 2 MB max.
              </span>
              <input
                aria-describedby="issue-image-help"
                accept={acceptedTypes}
                className="sr-only"
                name="image"
                onChange={(event) => {
                  const file = normalizeOptionalIssueImageFile(
                    event.target.files?.[0] || null,
                  );
                  const result = validateIssueImage(file);

                  setImageMessage(result.message);

                  if (imagePreviewUrl) {
                    URL.revokeObjectURL(imagePreviewUrl);
                  }

                  setImagePreviewUrl(
                    result.ok && file ? URL.createObjectURL(file) : null,
                  );
                }}
                type="file"
              />
            </label>
            <p id="issue-image-help" className="sr-only">
              Image upload is optional. Accepted types are JPEG, PNG, and WebP,
              with a maximum size of 2 MB.
            </p>
            {imageMessage ? (
              <p className="flex items-center gap-2 text-sm text-[#9d3f29]">
                <AlertTriangle className="size-4" aria-hidden="true" />
                {imageMessage}
              </p>
            ) : null}
            {imagePreviewUrl ? (
              <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
                <Image
                  alt="Selected issue image preview"
                  className="h-64 w-full object-cover"
                  height={512}
                  src={imagePreviewUrl}
                  unoptimized
                  width={960}
                />
              </div>
            ) : null}
          </section>

          <Button
            disabled={isPending || Boolean(imageMessage)}
            size="lg"
            type="submit"
          >
            <Send className="size-4" aria-hidden="true" />
            {isPending ? "Submitting..." : "Submit issue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
