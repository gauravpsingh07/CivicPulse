"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { UpvoteActionState } from "@/lib/issues/upvote-action-state";
import { toUserFacingQueryError } from "@/lib/supabase/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function toggleIssueUpvoteAction(
  _previousState: UpvoteActionState,
  formData: FormData,
): Promise<UpvoteActionState> {
  const parsed = z.uuid().safeParse(formData.get("issueId"));

  if (!parsed.success) {
    return {
      status: "error",
      upvoted: false,
      message: "This issue could not be identified.",
    };
  }

  const issueId = parsed.data;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      upvoted: false,
      message: "Supabase is not configured yet, so voting is disabled.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "auth_required",
      upvoted: false,
      message: "Sign in to confirm you are affected by this issue.",
    };
  }

  const { data: existingVote, error: lookupError } = await supabase
    .from("issue_upvotes")
    .select("issue_id")
    .eq("issue_id", issueId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    return {
      status: "error",
      upvoted: false,
      message: toUserFacingQueryError(lookupError),
    };
  }

  if (existingVote) {
    const { error: deleteError } = await supabase
      .from("issue_upvotes")
      .delete()
      .eq("issue_id", issueId)
      .eq("user_id", user.id);

    if (deleteError) {
      return {
        status: "error",
        upvoted: true,
        message: toUserFacingQueryError(deleteError),
      };
    }
  } else {
    const { error: insertError } = await supabase.from("issue_upvotes").insert({
      issue_id: issueId,
      user_id: user.id,
    });

    if (insertError) {
      return {
        status: "error",
        upvoted: false,
        message: toUserFacingQueryError(insertError),
      };
    }
  }

  revalidatePath(`/issues/${issueId}`);
  revalidatePath("/issues");
  revalidatePath("/map");
  revalidatePath("/stats");

  return {
    status: "success",
    upvoted: !existingVote,
    message: existingVote
      ? "Your vote was removed."
      : "Thanks — this helps admins prioritize.",
  };
}
