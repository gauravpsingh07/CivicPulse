import type {
  ISSUE_CATEGORIES,
  ISSUE_STATUSES,
  ISSUE_URGENCY_LEVELS,
} from "@/lib/constants";

export type IssueCategory = (typeof ISSUE_CATEGORIES)[number]["value"];
export type IssueUrgency = (typeof ISSUE_URGENCY_LEVELS)[number]["value"];
export type IssueStatus = (typeof ISSUE_STATUSES)[number]["value"];
export type UserRole = "user" | "admin";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type IssueSummary = {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  urgency: IssueUrgency;
  status: IssueStatus;
  location: Coordinates;
  imagePath?: string | null;
  reporterId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AppConfigStatus = {
  hasSupabaseUrl: boolean;
  hasSupabaseAnonKey: boolean;
  hasDiscordWebhook: boolean;
};
