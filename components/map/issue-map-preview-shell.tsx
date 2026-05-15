"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const IssueMapPreview = dynamic(
  () =>
    import("@/components/map/issue-map-preview").then(
      (module) => module.IssueMapPreview,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full rounded-lg" />,
  },
);

export function IssueMapPreviewShell({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  return <IssueMapPreview latitude={latitude} longitude={longitude} />;
}
