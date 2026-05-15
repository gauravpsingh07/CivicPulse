import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ImageIcon,
  MapPin,
  UserRound,
} from "lucide-react";
import { AdminCommentForm } from "@/components/admin/admin-comment-form";
import { StatusUpdateDialog } from "@/components/admin/status-update-dialog";
import { CommentList } from "@/components/issues/comment-list";
import {
  IssueStatusBadge,
  IssueUrgencyBadge,
} from "@/components/issues/issue-status-badge";
import { IssueTimeline } from "@/components/issues/issue-timeline";
import { IssueMapPreviewShell } from "@/components/map/issue-map-preview-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminIssueById } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/dates";
import { getIssueCategoryLabel } from "@/lib/issues/status";

type AdminIssuePageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminIssuePage({ params }: AdminIssuePageProps) {
  const { id } = await params;
  const detail = await getAdminIssueById(id);

  if (!detail) {
    return <AdminIssueUnavailable />;
  }

  const { comments, issue, timeline } = detail;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <Link
          className="inline-flex text-sm font-semibold text-[var(--accent-strong)]"
          href="/admin"
        >
          Back to admin dashboard
        </Link>

        <section className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap gap-2">
                  <IssueStatusBadge status={issue.status} />
                  <IssueUrgencyBadge urgency={issue.urgency} />
                  <Badge variant="neutral">
                    {getIssueCategoryLabel(issue.category)}
                  </Badge>
                  {!issue.is_public ? (
                    <Badge variant="warning">Private</Badge>
                  ) : null}
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
                        No image is attached to this issue.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <IssueTimeline events={timeline} />
            <CommentList
              canViewPrivateComments
              comments={comments}
              emptyMessage="No public updates or private admin notes have been posted yet."
              title="Updates and admin notes"
            />
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Moderation actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <StatusUpdateDialog
                  currentStatus={issue.status}
                  issueId={issue.id}
                />
                <div className="rounded-lg border border-[var(--line)] bg-white p-4">
                  <p className="text-sm font-semibold">
                    Resolution timestamp rule
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Moving to resolved or closed sets `resolved_at`. Reopening
                    to open or in progress clears it. Duplicate and rejected
                    preserve the current value.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add update or note</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminCommentForm issueId={issue.id} />
              </CardContent>
            </Card>

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
                  icon={<UserRound className="size-4" aria-hidden="true" />}
                  label="Reporter"
                  value={
                    issue.reporter?.full_name ||
                    issue.reporter_id ||
                    "Demo seed issue"
                  }
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
              <CardContent>
                <IssueMapPreviewShell
                  latitude={Number(issue.latitude)}
                  longitude={Number(issue.longitude)}
                />
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </main>
  );
}

function AdminIssueUnavailable() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[var(--background)] px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <Badge variant="danger">Unavailable</Badge>
            <CardTitle className="mt-5 text-3xl">
              Admin issue data unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Supabase is not configured yet, so this moderation page cannot
              load issue details.
            </p>
            <Link
              className={buttonVariants({ className: "mt-6" })}
              href="/admin"
            >
              Back to admin
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
  icon: React.ReactNode;
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
