"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { ISSUE_IMAGES_BUCKET } from "@/lib/constants";
import {
  buildIssueImagePath,
  normalizeOptionalIssueImageFile,
  validateIssueImage,
  type ImageFileLike,
} from "@/lib/images";
import type { CreateIssueActionState } from "@/lib/issues/action-state";
import { sendHighPriorityIssueAlert } from "@/lib/notifications/discord";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";
import { createIssueSchema } from "@/lib/validators/issue";

export async function createIssueAction(
  _previousState: CreateIssueActionState,
  formData: FormData,
): Promise<CreateIssueActionState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message:
        "Supabase is not configured yet. Add the public Supabase URL and anon key before submitting reports.",
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?error=auth-required&next=/issues/new");
  }

  const imageFile = getOptionalImageFile(formData.get("image"));
  const imageValidation = validateIssueImage(imageFile);

  if (!imageValidation.ok) {
    return {
      status: "error",
      message: imageValidation.message,
    };
  }

  const parsed = createIssueSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    urgency: formData.get("urgency"),
    addressLabel: formData.get("addressLabel"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    image: imageFile
      ? {
          name: imageFile.name,
          size: imageFile.size,
          type: imageFile.type,
        }
      : undefined,
    isPublic: true,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message:
        parsed.error.issues[0]?.message ||
        "Check the report details and try again.",
    };
  }

  const issueId = randomUUID();

  const { data: issue, error: insertError } = await supabase
    .from("issues")
    .insert({
      id: issueId,
      reporter_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      urgency: parsed.data.urgency,
      status: "open",
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      address_label: parsed.data.addressLabel || null,
      image_path: null,
      is_public: true,
    })
    .select("*")
    .single();

  if (insertError || !issue) {
    return {
      status: "error",
      message: insertError?.message || "Unable to create the issue report.",
    };
  }

  let issueWithImage = issue;

  if (imageFile) {
    const imagePath = buildIssueImagePath({
      userId: user.id,
      issueId,
      fileName: imageFile.name,
    });

    const { error: uploadError } = await supabase.storage
      .from(ISSUE_IMAGES_BUCKET)
      .upload(imagePath, imageFile, {
        cacheControl: "3600",
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        status: "partial",
        createdIssueId: issueId,
        message: `Issue created, but image upload failed: ${uploadError.message}`,
      };
    }

    const { data: updatedIssue, error: updateError } = await supabase
      .from("issues")
      .update({ image_path: imagePath })
      .eq("id", issueId)
      .select("*")
      .single();

    if (updateError || !updatedIssue) {
      await supabase.storage.from(ISSUE_IMAGES_BUCKET).remove([imagePath]);

      return {
        status: "partial",
        createdIssueId: issueId,
        message:
          updateError?.message ||
          "Issue created, but the uploaded image could not be attached.",
      };
    }

    issueWithImage = updatedIssue;
  }

  await recordHighPriorityNotification(issueWithImage);

  redirect(`/issues/${issueId}?created=1`);
}

async function recordHighPriorityNotification(issue: Tables<"issues">) {
  if (issue.urgency !== "high" && issue.urgency !== "critical") {
    return;
  }

  const alertResult = await sendHighPriorityIssueAlert(issue);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return;
  }

  await supabase.from("notifications").insert({
    issue_id: issue.id,
    channel: "discord",
    event_type: `${issue.urgency}_issue_created`,
    status: alertResult.status,
    error_message: alertResult.errorMessage,
    sent_at: alertResult.status === "sent" ? new Date().toISOString() : null,
  });
}

function getOptionalImageFile(value: FormDataEntryValue | null) {
  if (!value || typeof value === "string") {
    return null;
  }

  const file = value as File;

  if (!file.name && file.size === 0) {
    return null;
  }

  return normalizeOptionalIssueImageFile(file as File & ImageFileLike);
}
