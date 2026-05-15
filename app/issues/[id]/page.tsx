import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ImageIcon,
  MapPin,
} from "lucide-react";
import { CommentList } from "@/components/issues/comment-list";
import { RealtimeRefreshPrompt } from "@/components/realtime/realtime-refresh-prompt";
import {
  IssueStatusBadge,
  IssueUrgencyBadge,
} from "@/components/issues/issue-status-badge";
import { IssueTimeline } from "@/components/issues/issue-timeline";
import { IssueMapPreviewShell } from "@/components/map/issue-map-preview-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, getResolutionDurationLabel } from "@/lib/dates";
import { getIssueById } from "@/lib/issues/public";
import { getIssueCategoryLabel } from "@/lib/issues/status";

type IssueDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function IssueDetailPage({
  params,
  searchParams,
}: IssueDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const result = await getIssueById(id);
  const wasCreated = getSingleParam(query, "created") === "1";

  if (result.status === "not_found") {
    notFound();
  }

  if (result.status !== "ready") {
    return (
      <IssueDetailError title="Unable to load issue" message={result.message} />
    );
  }

  const { comments, issue, timeline, canViewPrivateComments } = result.detail;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Link
          className="inline-flex text-sm font-semibold text-[var(--accent-strong)]"
          href="/issues"
        >
          Back to public issues
        </Link>

        <RealtimeRefreshPrompt
          channelName={`public-issue-${issue.id}`}
          description="This public detail page listens only for this issue. Refreshing reloads through server-side visibility rules so private notes stay hidden."
          issueId={issue.id}
          mode="issue-detail"
        />

        <section className="grid gap-8 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  {wasCreated ? (
                    <Badge variant="success">
                      <CheckCircle2
                        className="mr-1 size-3"
                        aria-hidden="true"
                      />
                      Issue submitted
                    </Badge>
                  ) : null}
                  <IssueStatusBadge status={issue.status} />
                  <IssueUrgencyBadge urgency={issue.urgency} />
                  <Badge variant="neutral">
                    {getIssueCategoryLabel(issue.category)}
                  </Badge>
                </div>
                <CardTitle className="mt-5 text-4xl">{issue.title}</CardTitle>
                <p className="mt-3 text-base leading-7 text-[var(--muted)]">
                  {issue.description}
                </p>
              </CardHeader>
              <CardContent>
                {issue.image_url ? (
                  <Image
                    alt={`Photo for ${issue.title}`}
                    className="max-h-[520px] w-full rounded-lg border border-[var(--line)] object-cover"
                    height={900}
                    src={issue.image_url}
                    unoptimized
                    width={1400}
                  />
                ) : (
                  <div className="grid min-h-52 place-items-center rounded-lg border border-dashed border-[var(--line)] bg-white text-center">
                    <div>
                      <ImageIcon
                        className="mx-auto size-8 text-[var(--muted)]"
                        aria-hidden="true"
                      />
                      <p className="mt-3 text-sm text-[var(--muted)]">
                        No public image was attached to this issue.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <IssueTimeline events={timeline} />
            <CommentList
              canViewPrivateComments={canViewPrivateComments}
              comments={comments}
            />
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <DetailRow
                  icon={<CalendarDays className="size-4" aria-hidden="true" />}
                  label="Created"
                  value={formatDateTime(issue.created_at)}
                />
                <DetailRow
                  icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
                  label="Resolved"
                  value={
                    issue.resolved_at
                      ? formatDateTime(issue.resolved_at)
                      : "Not resolved yet"
                  }
                />
                <DetailRow
                  icon={<Clock className="size-4" aria-hidden="true" />}
                  label="Resolution time"
                  value={getResolutionDurationLabel(
                    issue.created_at,
                    issue.resolved_at,
                  )}
                />
                <DetailRow
                  icon={<MapPin className="size-4" aria-hidden="true" />}
                  label="Location"
                  value={
                    issue.address_label ||
                    `${Number(issue.latitude).toFixed(6)}, ${Number(issue.longitude).toFixed(6)}`
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Map preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <IssueMapPreviewShell
                  latitude={Number(issue.latitude)}
                  longitude={Number(issue.longitude)}
                />
                <p className="text-xs leading-5 text-[var(--muted)]">
                  OpenStreetMap attribution is shown in the map control.
                </p>
              </CardContent>
            </Card>

            <Link
              className={buttonVariants({ size: "lg", className: "w-full" })}
              href="/issues/new"
            >
              Report another issue
            </Link>
          </aside>
        </section>
      </div>
    </main>
  );
}

function IssueDetailError({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <Badge variant="danger">Issue unavailable</Badge>
            <CardTitle className="mt-5 text-3xl">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-[var(--muted)]">{message}</p>
            <Link
              className={buttonVariants({ className: "mt-6" })}
              href="/issues"
            >
              Back to public issues
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-[var(--line)] bg-white p-3">
      <span className="mt-0.5 text-[var(--accent-strong)]">{icon}</span>
      <div>
        <p className="font-semibold">{label}</p>
        <p className="mt-1 text-[var(--muted)]">{value}</p>
      </div>
    </div>
  );
}

function getSingleParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = params?.[key];

  return Array.isArray(value) ? value[0] : value;
}
