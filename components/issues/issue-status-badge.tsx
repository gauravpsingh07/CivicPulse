import { Badge } from "@/components/ui/badge";
import {
  getIssueStatusBadgeVariant,
  getIssueStatusLabel,
  getIssueUrgencyBadgeVariant,
  getIssueUrgencyLabel,
} from "@/lib/issues/status";
import type { IssueStatus, IssueUrgency } from "@/lib/types";

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  return (
    <Badge variant={getIssueStatusBadgeVariant(status)}>
      {getIssueStatusLabel(status)}
    </Badge>
  );
}

export function IssueUrgencyBadge({ urgency }: { urgency: IssueUrgency }) {
  return (
    <Badge variant={getIssueUrgencyBadgeVariant(urgency)}>
      {getIssueUrgencyLabel(urgency)}
    </Badge>
  );
}
