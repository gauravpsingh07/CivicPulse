import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IssueStatusBadge,
  IssueUrgencyBadge,
} from "@/components/issues/issue-status-badge";
import { formatDateOnly } from "@/lib/dates";
import { getIssueCategoryLabel } from "@/lib/issues/status";
import type { PublicIssue } from "@/lib/issues/public";

export function IssueCard({ issue }: { issue: PublicIssue }) {
  return (
    <Card className="overflow-hidden">
      {issue.image_url ? (
        <Image
          alt={`Photo for ${issue.title}`}
          className="h-44 w-full object-cover"
          height={360}
          src={issue.image_url}
          unoptimized
          width={720}
        />
      ) : null}
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <IssueStatusBadge status={issue.status} />
          <IssueUrgencyBadge urgency={issue.urgency} />
          <Badge variant="neutral">
            {getIssueCategoryLabel(issue.category)}
          </Badge>
        </div>
        <CardTitle className="mt-4 text-xl">
          <Link
            className="hover:text-[var(--accent-strong)]"
            href={`/issues/${issue.id}`}
          >
            {issue.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-3 text-sm leading-6 text-[var(--muted)]">
          {issue.description}
        </p>
        <div className="mt-5 grid gap-2 text-sm text-[var(--muted)]">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatDateOnly(issue.created_at)}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4" aria-hidden="true" />
            {issue.address_label ||
              `${Number(issue.latitude).toFixed(4)}, ${Number(issue.longitude).toFixed(4)}`}
          </span>
        </div>
        <Link
          className="mt-6 inline-flex text-sm font-semibold text-[var(--accent-strong)]"
          href={`/issues/${issue.id}`}
        >
          View issue details
        </Link>
      </CardContent>
    </Card>
  );
}
