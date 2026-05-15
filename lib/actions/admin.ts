"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isAdminProfile } from "@/lib/auth/utils";
import type { AdminActionState } from "@/lib/admin/action-state";
import { getResolvedAtForStatusTransition } from "@/lib/admin/status-transitions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Tables } from "@/lib/types/database";
import {
  createIssueCommentSchema,
  updateIssueStatusSchema,
} from "@/lib/validators/issue";

export async function updateIssueStatusAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getAdminActionContext();

  if (!admin.ok) {
    return admin.state;
  }

  const parsed = updateIssueStatusSchema.safeParse({
    issueId: formData.get("issueId"),
    status: formData.get("status"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ||
        "Check the status update and try again.",
    };
  }

  const { data: existingIssue, error: fetchError } = await admin.supabase
    .from("issues")
    .select("*")
    .eq("id", parsed.data.issueId)
    .single();

  if (fetchError || !existingIssue) {
    return {
      status: "error",
      message: fetchError?.message || "Issue not found.",
    };
  }

  const resolvedAt = getResolvedAtForStatusTransition({
    nextStatus: parsed.data.status,
    previousResolvedAt: existingIssue.resolved_at,
  });

  const { error: updateError } = await admin.supabase
    .from("issues")
    .update({
      status: parsed.data.status,
      resolved_at: resolvedAt,
    })
    .eq("id", parsed.data.issueId);

  if (updateError) {
    return {
      status: "error",
      message: updateError.message,
    };
  }

  if (existingIssue.status !== parsed.data.status) {
    const { error: historyError } = await admin.supabase
      .from("issue_status_history")
      .insert({
        issue_id: existingIssue.id,
        changed_by: admin.user.id,
        from_status: existingIssue.status,
        to_status: parsed.data.status,
        note: parsed.data.note || null,
      });

    if (historyError) {
      return {
        status: "error",
        message: `Status updated, but history could not be recorded: ${historyError.message}`,
      };
    }
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/issues/${parsed.data.issueId}`);
  revalidatePath(`/issues/${parsed.data.issueId}`);
  revalidatePath("/issues");
  revalidatePath("/map");

  return {
    status: "success",
    message:
      existingIssue.status === parsed.data.status
        ? "Status was already set to that value."
        : "Issue status updated and history recorded.",
  };
}

export async function createAdminIssueCommentAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await getAdminActionContext();

  if (!admin.ok) {
    return admin.state;
  }

  const parsed = createIssueCommentSchema.safeParse({
    issueId: formData.get("issueId"),
    body: formData.get("body"),
    isPublic: formData.get("visibility") === "public",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message || "Check the note and try again.",
    };
  }

  const { error } = await admin.supabase.from("issue_comments").insert({
    issue_id: parsed.data.issueId,
    author_id: admin.user.id,
    body: parsed.data.body,
    is_public: parsed.data.isPublic,
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  revalidatePath(`/admin/issues/${parsed.data.issueId}`);

  if (parsed.data.isPublic) {
    revalidatePath(`/issues/${parsed.data.issueId}`);
  }

  return {
    status: "success",
    message: parsed.data.isPublic
      ? "Public update posted."
      : "Private admin note saved.",
  };
}

async function getAdminActionContext(): Promise<
  | {
      ok: true;
      supabase: SupabaseClient<Database>;
      user: User;
      profile: Tables<"profiles">;
    }
  | { ok: false; state: AdminActionState }
> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      state: {
        status: "error",
        message:
          "Supabase is not configured yet. Add public Supabase credentials before moderating issues.",
      },
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "Sign in as an admin to continue.",
      },
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !isAdminProfile(profile)) {
    return {
      ok: false,
      state: {
        status: "error",
        message: "Admin access is required for this action.",
      },
    };
  }

  return {
    ok: true,
    supabase,
    user,
    profile,
  };
}
