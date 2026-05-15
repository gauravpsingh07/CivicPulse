"use client";

import { RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getRealtimeStatusCopy } from "@/lib/realtime/issue-merge";

export type RealtimeIndicatorStatus =
  | "disabled"
  | "connecting"
  | "connected"
  | "reconnecting";

export function RealtimeIndicator({
  status,
}: {
  status: RealtimeIndicatorStatus;
}) {
  const variant = status === "connected" ? "success" : "neutral";

  return (
    <Badge variant={variant}>
      <RadioTower className="mr-1 size-3" aria-hidden="true" />
      {getRealtimeStatusCopy(status)}
    </Badge>
  );
}
