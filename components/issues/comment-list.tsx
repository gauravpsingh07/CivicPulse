import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";
import type { Tables } from "@/lib/types/database";

export function CommentList({
  canViewPrivateComments,
  comments,
  emptyMessage = "No public updates have been posted for this issue yet.",
  title = "Public updates",
}: {
  canViewPrivateComments: boolean;
  comments: Tables<"issue_comments">[];
  emptyMessage?: string;
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {comments.length ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <article
                className="rounded-lg border border-[var(--line)] bg-white p-4"
                key={comment.id}
              >
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
                  <MessageSquare className="size-4" aria-hidden="true" />
                  {formatDateTime(comment.created_at)}
                  {!comment.is_public && canViewPrivateComments ? (
                    <span className="rounded-md bg-[var(--surface-strong)] px-2 py-1 text-xs font-semibold">
                      Private note
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-6">{comment.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--muted)]">
            {emptyMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
