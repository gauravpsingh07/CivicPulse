"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { PublicMapIssueMarker } from "@/lib/map/markers";

const PublicIssueMap = dynamic(
  () =>
    import("@/components/map/public-issue-map").then(
      (module) => module.PublicIssueMap,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[62vh] min-h-[420px] w-full" />,
  },
);

export function PublicIssueMapShell({
  issues,
}: {
  issues: PublicMapIssueMarker[];
}) {
  return <PublicIssueMap issues={issues} />;
}
