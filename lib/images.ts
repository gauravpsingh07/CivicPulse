import {
  ACCEPTED_IMAGE_TYPES,
  IMAGE_UPLOAD_LIMIT_BYTES,
  ISSUE_IMAGES_BUCKET,
} from "@/lib/constants";

export type ImageFileLike = {
  name: string;
  size: number;
  type: string;
};

export type ImageValidationResult =
  | { ok: true; message: null }
  | { ok: false; message: string };

export function normalizeOptionalIssueImageFile<T extends ImageFileLike>(
  file: T | null | undefined,
): T | null {
  if (!file) {
    return null;
  }

  return isEmptyIssueImagePlaceholder(file) ? null : file;
}

export function validateIssueImage(
  file: ImageFileLike | null | undefined,
): ImageValidationResult {
  const selectedFile = normalizeOptionalIssueImageFile(file);

  if (!selectedFile) {
    return { ok: true, message: null };
  }

  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      selectedFile.type as (typeof ACCEPTED_IMAGE_TYPES)[number],
    )
  ) {
    return {
      ok: false,
      message: "Use a JPEG, PNG, or WebP image.",
    };
  }

  if (selectedFile.size > IMAGE_UPLOAD_LIMIT_BYTES) {
    return {
      ok: false,
      message: "Images must be 2 MB or smaller.",
    };
  }

  if (selectedFile.size <= 0) {
    return {
      ok: false,
      message: "Choose a non-empty image file.",
    };
  }

  return { ok: true, message: null };
}

export function isEmptyIssueImagePlaceholder(file: ImageFileLike) {
  const name = file.name.trim().toLowerCase();
  const type = file.type.trim().toLowerCase();

  return (
    file.size === 0 &&
    (name === "" ||
      name === "undefined" ||
      name === "null" ||
      (name === "blob" && (type === "" || type === "application/octet-stream")))
  );
}

export function sanitizeImageFileName(fileName: string) {
  const fallback = "issue-image";
  const sanitized = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

  return sanitized || fallback;
}

export function buildIssueImagePath({
  userId,
  issueId,
  fileName,
  timestamp = Date.now(),
}: {
  userId: string;
  issueId: string;
  fileName: string;
  timestamp?: number;
}) {
  return `${userId}/${issueId}/${timestamp}_${sanitizeImageFileName(fileName)}`;
}

export function getIssueImagePublicUrl(imagePath: string | null | undefined) {
  if (!imagePath) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return null;
  }

  const encodedPath = imagePath.split("/").map(encodeURIComponent).join("/");

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${ISSUE_IMAGES_BUCKET}/${encodedPath}`;
}
