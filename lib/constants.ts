export const ISSUE_CATEGORIES = [
  {
    value: "pothole",
    label: "Pothole",
    description: "Road surface damage, sinkholes, and pavement hazards.",
  },
  {
    value: "streetlight",
    label: "Streetlight",
    description: "Broken, flickering, or missing street lighting.",
  },
  {
    value: "sidewalk",
    label: "Sidewalk",
    description: "Unsafe walkways, curb damage, and pedestrian hazards.",
  },
  {
    value: "trash",
    label: "Trash",
    description: "Overflow, illegal dumping, and debris removal needs.",
  },
  {
    value: "water_leak",
    label: "Water leak",
    description: "Leaks, flooding, drainage, and standing water concerns.",
  },
  {
    value: "fallen_tree",
    label: "Fallen tree",
    description: "Tree limbs or obstructions affecting public right of way.",
  },
  {
    value: "accessibility",
    label: "Accessibility",
    description: "Barriers affecting wheelchair, mobility, or ADA access.",
  },
  {
    value: "other",
    label: "Other",
    description: "Civic concerns that do not fit another category.",
  },
] as const;

export const ISSUE_URGENCY_LEVELS = [
  {
    value: "low",
    label: "Low",
    description: "Can be handled in normal review.",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Needs attention but is not immediately hazardous.",
  },
  {
    value: "high",
    label: "High",
    description: "Potential safety impact or broad community concern.",
  },
  {
    value: "critical",
    label: "Critical",
    description: "Urgent safety risk that should trigger an alert.",
  },
] as const;

export const ISSUE_STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
  { value: "rejected", label: "Rejected" },
  { value: "duplicate", label: "Duplicate" },
] as const;

export const IMAGE_UPLOAD_LIMIT_BYTES = 2 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ISSUE_IMAGES_BUCKET = "issue-images";

export const OPENSTREETMAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const OPENSTREETMAP_TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const DEFAULT_MAP_CENTER = {
  latitude: 40.7128,
  longitude: -74.006,
  zoom: 12,
} as const;
