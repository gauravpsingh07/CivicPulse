"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ThumbsUp } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { toggleIssueUpvoteAction } from "@/lib/actions/upvotes";
import { initialUpvoteActionState } from "@/lib/issues/upvote-action-state";

export function UpvoteButton({
  issueId,
  initialCount,
  initiallyUpvoted,
  isSignedIn,
}: {
  issueId: string;
  initialCount: number;
  initiallyUpvoted: boolean;
  isSignedIn: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    toggleIssueUpvoteAction,
    initialUpvoteActionState,
  );

  const upvoted =
    state.status === "success" ? state.upvoted : initiallyUpvoted;
  const countDelta =
    state.status === "success" && state.upvoted !== initiallyUpvoted
      ? state.upvoted
        ? 1
        : -1
      : 0;
  const count = Math.max(0, initialCount + countDelta);

  if (!isSignedIn) {
    return (
      <div className="space-y-2">
        <Link
          className={buttonVariants({
            variant: "secondary",
            className: "w-full",
          })}
          href={`/login?next=${encodeURIComponent(`/issues/${issueId}`)}`}
        >
          <ThumbsUp className="size-4" aria-hidden="true" />
          I&apos;m also affected · {count}
        </Link>
        <p className="text-xs leading-5 text-[var(--muted)]">
          Sign in to confirm this issue affects you too.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input name="issueId" type="hidden" value={issueId} />
      <Button
        className="w-full"
        disabled={isPending}
        type="submit"
        variant={upvoted ? "secondary" : "primary"}
      >
        <ThumbsUp
          className={`size-4 ${upvoted ? "fill-current" : ""}`}
          aria-hidden="true"
        />
        {isPending
          ? "Saving..."
          : upvoted
            ? `You're affected · ${count}`
            : `I'm also affected · ${count}`}
      </Button>
      {state.message && state.status !== "success" ? (
        <p className="text-xs leading-5 text-[#9d3f29]">{state.message}</p>
      ) : null}
      <p className="text-xs leading-5 text-[var(--muted)]">
        {count === 1
          ? "1 resident is affected by this issue."
          : `${count} residents are affected by this issue.`}
      </p>
    </form>
  );
}
