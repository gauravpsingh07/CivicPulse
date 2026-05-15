import { z } from "zod";
import {
  ACCEPTED_IMAGE_TYPES,
  IMAGE_UPLOAD_LIMIT_BYTES,
  ISSUE_CATEGORIES,
  ISSUE_STATUSES,
  ISSUE_URGENCY_LEVELS,
} from "@/lib/constants";
import { isEmptyIssueImagePlaceholder, type ImageFileLike } from "@/lib/images";
import type { IssueCategory, IssueStatus, IssueUrgency } from "@/lib/types";

const issueCategoryValues = ISSUE_CATEGORIES.map((item) => item.value) as [
  IssueCategory,
  ...IssueCategory[],
];

const issueStatusValues = ISSUE_STATUSES.map((item) => item.value) as [
  IssueStatus,
  ...IssueStatus[],
];

const issueUrgencyValues = ISSUE_URGENCY_LEVELS.map((item) => item.value) as [
  IssueUrgency,
  ...IssueUrgency[],
];

const acceptedImageTypes = ACCEPTED_IMAGE_TYPES as unknown as [
  (typeof ACCEPTED_IMAGE_TYPES)[number],
  ...(typeof ACCEPTED_IMAGE_TYPES)[number][],
];

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const optionalImageToUndefined = (value: unknown) => {
  if (value == null) {
    return undefined;
  }

  if (isImageFileLike(value) && isEmptyIssueImagePlaceholder(value)) {
    return undefined;
  }

  return value;
};

const isImageFileLike = (value: unknown): value is ImageFileLike =>
  typeof value === "object" &&
  value !== null &&
  "name" in value &&
  "size" in value &&
  "type" in value &&
  typeof value.name === "string" &&
  typeof value.size === "number" &&
  typeof value.type === "string";

export const issueCategorySchema = z.enum(issueCategoryValues);
export const issueStatusSchema = z.enum(issueStatusValues);
export const issueUrgencySchema = z.enum(issueUrgencyValues);

export const issueImageMetadataSchema = z.object({
  name: z.string().trim().min(1).max(180),
  size: z
    .number()
    .int()
    .positive()
    .max(IMAGE_UPLOAD_LIMIT_BYTES, "Images must be 2 MB or smaller."),
  type: z.enum(acceptedImageTypes),
});

export const createIssueSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(2000),
  category: issueCategorySchema,
  urgency: issueUrgencySchema.default("medium"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  addressLabel: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(180).optional(),
  ),
  image: z.preprocess(
    optionalImageToUndefined,
    issueImageMetadataSchema.optional(),
  ),
  isPublic: z.boolean().default(true),
});

export const issueFiltersSchema = z.object({
  category: issueCategorySchema.optional(),
  status: issueStatusSchema.optional(),
  urgency: issueUrgencySchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  bounds: z
    .object({
      north: z.coerce.number().min(-90).max(90),
      south: z.coerce.number().min(-90).max(90),
      east: z.coerce.number().min(-180).max(180),
      west: z.coerce.number().min(-180).max(180),
    })
    .refine((bounds) => bounds.north >= bounds.south, {
      message: "North must be greater than or equal to south.",
      path: ["north"],
    })
    .optional(),
});

export const updateIssueStatusSchema = z.object({
  issueId: z.uuid(),
  status: issueStatusSchema,
  note: z.preprocess(emptyToUndefined, z.string().trim().max(1000).optional()),
});

export const createIssueCommentSchema = z.object({
  issueId: z.uuid(),
  body: z.string().trim().min(1).max(1000),
  isPublic: z.boolean().default(true),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type IssueFiltersInput = z.infer<typeof issueFiltersSchema>;
export type UpdateIssueStatusInput = z.infer<typeof updateIssueStatusSchema>;
export type CreateIssueCommentInput = z.infer<typeof createIssueCommentSchema>;
