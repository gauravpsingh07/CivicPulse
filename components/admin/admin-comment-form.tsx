"use client";

import { useActionState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { createAdminIssueCommentAction } from "@/lib/actions/admin";
import { initialAdminActionState } from "@/lib/admin/action-state";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AdminCommentForm({ issueId }: { issueId: string }) {
  const [state, formAction, isPending] = useActionState(
    createAdminIssueCommentAction,
    initialAdminActionState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input name="issueId" type="hidden" value={issueId} />
      <AuthErrorMessage
        tone={state.status === "success" ? "success" : "error"}
        message={state.message}
      />
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Visibility</span>
        <Select defaultValue="public" name="visibility">
          <option value="public">Public update</option>
          <option value="private">Private admin note</option>
        </Select>
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold">Comment or note</span>
        <Textarea
          maxLength={1000}
          name="body"
          placeholder="Write an update for residents or a private admin note"
          required
        />
      </label>
      <Button disabled={isPending} type="submit">
        <MessageSquarePlus className="size-4" aria-hidden="true" />
        {isPending ? "Saving..." : "Add update"}
      </Button>
    </form>
  );
}
