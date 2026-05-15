import { describe, expect, it } from "vitest";
import { IMAGE_UPLOAD_LIMIT_BYTES } from "@/lib/constants";
import {
  buildIssueImagePath,
  normalizeOptionalIssueImageFile,
  sanitizeImageFileName,
  validateIssueImage,
} from "@/lib/images";

describe("image validation helpers", () => {
  it("treats absent images and empty file-input placeholders as optional", () => {
    expect(validateIssueImage(undefined)).toEqual({ ok: true, message: null });
    expect(validateIssueImage(null)).toEqual({ ok: true, message: null });

    const emptyPlaceholder = {
      name: "",
      size: 0,
      type: "application/octet-stream",
    };

    expect(normalizeOptionalIssueImageFile(emptyPlaceholder)).toBeNull();
    expect(validateIssueImage(emptyPlaceholder)).toEqual({
      ok: true,
      message: null,
    });

    expect(
      normalizeOptionalIssueImageFile({
        name: "undefined",
        size: 0,
        type: "application/octet-stream",
      }),
    ).toBeNull();
  });

  it("accepts supported images under the size limit", () => {
    expect(
      validateIssueImage({
        name: "sidewalk.webp",
        size: IMAGE_UPLOAD_LIMIT_BYTES,
        type: "image/webp",
      }),
    ).toEqual({ ok: true, message: null });
  });

  it("rejects unsupported image types and oversized files", () => {
    expect(
      validateIssueImage({
        name: "sidewalk.gif",
        size: 1200,
        type: "image/gif",
      }).ok,
    ).toBe(false);

    expect(
      validateIssueImage({
        name: "huge.png",
        size: IMAGE_UPLOAD_LIMIT_BYTES + 1,
        type: "image/png",
      }).ok,
    ).toBe(false);
  });

  it("rejects selected zero-byte image files instead of treating them as absent", () => {
    expect(
      validateIssueImage({
        name: "empty.png",
        size: 0,
        type: "image/png",
      }),
    ).toEqual({
      ok: false,
      message: "Choose a non-empty image file.",
    });
  });

  it("sanitizes storage file names", () => {
    expect(sanitizeImageFileName(" Unsafe Report Photo (1).PNG ")).toBe(
      "unsafe-report-photo-1-.png",
    );
  });

  it("builds user and issue scoped storage paths", () => {
    expect(
      buildIssueImagePath({
        userId: "user-1",
        issueId: "issue-1",
        fileName: "Road Leak.webp",
        timestamp: 123,
      }),
    ).toBe("user-1/issue-1/123_road-leak.webp");
  });
});
