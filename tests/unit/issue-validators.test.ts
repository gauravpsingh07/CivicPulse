import { describe, expect, it } from "vitest";
import { IMAGE_UPLOAD_LIMIT_BYTES } from "@/lib/constants";
import {
  createIssueCommentSchema,
  createIssueSchema,
  issueFiltersSchema,
  updateIssueStatusSchema,
} from "@/lib/validators/issue";

const validIssueInput = {
  title: "Broken streetlight near school",
  description:
    "The streetlight beside the school crosswalk is out and visibility is poor at night.",
  category: "streetlight",
  urgency: "high",
  latitude: "40.7128",
  longitude: "-74.006",
  image: {
    name: "streetlight.webp",
    size: IMAGE_UPLOAD_LIMIT_BYTES,
    type: "image/webp",
  },
};

describe("issue validators", () => {
  it("accepts a valid issue and coerces coordinate strings", () => {
    const parsed = createIssueSchema.parse(validIssueInput);

    expect(parsed.latitude).toBe(40.7128);
    expect(parsed.longitude).toBe(-74.006);
    expect(parsed.isPublic).toBe(true);
  });

  it("accepts issues without an image", () => {
    expect(
      createIssueSchema.parse({ ...validIssueInput, image: undefined }).image,
    ).toBeUndefined();
    expect(
      createIssueSchema.parse({ ...validIssueInput, image: null }).image,
    ).toBeUndefined();
    expect(
      createIssueSchema.parse({
        ...validIssueInput,
        image: {
          name: "",
          size: 0,
          type: "application/octet-stream",
        },
      }).image,
    ).toBeUndefined();
  });

  it("rejects issue titles that are too short", () => {
    const result = createIssueSchema.safeParse({
      ...validIssueInput,
      title: "Bad",
    });

    expect(result.success).toBe(false);
  });

  it("rejects unsupported or oversized images", () => {
    const result = createIssueSchema.safeParse({
      ...validIssueInput,
      image: {
        name: "large.gif",
        size: IMAGE_UPLOAD_LIMIT_BYTES + 1,
        type: "image/gif",
      },
    });

    expect(result.success).toBe(false);

    expect(
      createIssueSchema.safeParse({
        ...validIssueInput,
        image: {
          name: "empty.png",
          size: 0,
          type: "image/png",
        },
      }).success,
    ).toBe(false);
  });

  it("applies filter pagination defaults and limits page size", () => {
    expect(issueFiltersSchema.parse({}).pageSize).toBe(20);

    const result = issueFiltersSchema.safeParse({ pageSize: 100 });
    expect(result.success).toBe(false);
  });

  it("validates status updates and comments", () => {
    const issueId = "00000000-0000-4000-8000-000000000101";

    expect(
      updateIssueStatusSchema.parse({
        issueId,
        status: "in_progress",
        note: "",
      }),
    ).toEqual({
      issueId,
      status: "in_progress",
      note: undefined,
    });

    expect(
      createIssueCommentSchema.parse({
        issueId,
        body: " Thanks for the update. ",
      }),
    ).toEqual({
      issueId,
      body: "Thanks for the update.",
      isPublic: true,
    });
  });
});
