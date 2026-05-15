"use client";

import { useActionState, useState } from "react";
import { PencilLine } from "lucide-react";
import { updateIssueStatusAction } from "@/lib/actions/admin";
import { initialAdminActionState } from "@/lib/admin/action-state";
import { ISSUE_STATUSES } from "@/lib/constants";
import type { IssueStatus } from "@/lib/types";
import { AuthErrorMessage } from "@/components/auth/auth-error-message";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function StatusUpdateDialog({
  currentStatus,
  issueId,
}: {
  currentStatus: IssueStatus;
  issueId: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateIssueStatusAction,
    initialAdminActionState,
  );

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg">
        <PencilLine className="size-4" aria-hidden="true" />
        Update status
      </Button>
      <Dialog
        description="Status changes are written by a server-side admin action and recorded in issue history."
        onOpenChange={setOpen}
        open={open}
        title="Update issue status"
      >
        <form action={formAction} className="space-y-5">
          <input name="issueId" type="hidden" value={issueId} />
          <AuthErrorMessage
            tone={state.status === "success" ? "success" : "error"}
            message={state.message}
          />
          <label className="block space-y-2">
            <span className="text-sm font-semibold">Status</span>
            <Select defaultValue={currentStatus} name="status" required>
              {ISSUE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold">History note</span>
            <Textarea
              maxLength={1000}
              name="note"
              placeholder="Optional public moderation note for the status timeline"
            />
          </label>
          <div className="flex justify-end gap-3">
            <Button
              disabled={isPending}
              onClick={() => setOpen(false)}
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save status"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
