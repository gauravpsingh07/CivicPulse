import type { IssueStatus } from "@/lib/types";

export type StatusResolutionInput = {
  nextStatus: IssueStatus;
  previousResolvedAt: string | null;
  now?: Date;
};

export function getResolvedAtForStatusTransition({
  nextStatus,
  now = new Date(),
  previousResolvedAt,
}: StatusResolutionInput) {
  if (nextStatus === "resolved" || nextStatus === "closed") {
    return previousResolvedAt || now.toISOString();
  }

  if (nextStatus === "open" || nextStatus === "in_progress") {
    return null;
  }

  return previousResolvedAt;
}

export function shouldWriteStatusHistory(
  fromStatus: IssueStatus,
  toStatus: IssueStatus,
) {
  return fromStatus !== toStatus;
}
