import {
  getIssueCategoryLabel,
  getIssueStatusLabel,
  getIssueUrgencyLabel,
} from "@/lib/issues/status";
import type { Tables } from "@/lib/types/database";

export const DISCORD_NOTIFICATION_CHANNEL = "discord";
export const HIGH_PRIORITY_ISSUE_CREATED_EVENT = "high_priority_issue_created";

export type DiscordAlertIssue = Pick<
  Tables<"issues">,
  | "id"
  | "title"
  | "description"
  | "category"
  | "urgency"
  | "status"
  | "latitude"
  | "longitude"
  | "address_label"
>;

export type DiscordWebhookPayload = {
  username: string;
  content: string;
  embeds: Array<{
    title: string;
    url: string;
    description: string;
    color: number;
    fields: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    footer: {
      text: string;
    };
  }>;
};

export function shouldSendHighPriorityIssueAlert(issue: DiscordAlertIssue) {
  return issue.urgency === "high" || issue.urgency === "critical";
}

export function buildDiscordIssueAlertPayload(
  issue: DiscordAlertIssue,
  appUrl: string,
): DiscordWebhookPayload {
  const issueUrl = buildIssueDetailUrl(issue.id, appUrl);
  const urgencyLabel = getIssueUrgencyLabel(issue.urgency);

  return {
    username: "CivicPulse",
    content: "CivicPulse: New high-priority issue reported",
    embeds: [
      {
        title: "New high-priority issue reported",
        url: issueUrl,
        description: issue.description.slice(0, 300),
        color: issue.urgency === "critical" ? 0x9d3f29 : 0x8a5b0d,
        fields: [
          {
            name: "Title",
            value: issue.title,
            inline: false,
          },
          {
            name: "Category",
            value: getIssueCategoryLabel(issue.category),
            inline: true,
          },
          {
            name: "Urgency",
            value: urgencyLabel,
            inline: true,
          },
          {
            name: "Status",
            value: getIssueStatusLabel(issue.status),
            inline: true,
          },
          {
            name: "Location",
            value: getIssueAlertLocation(issue),
            inline: false,
          },
          {
            name: "Issue link",
            value: issueUrl,
            inline: false,
          },
        ],
        footer: {
          text: "CivicPulse",
        },
      },
    ],
  };
}

export function getIssueAlertLocation(issue: DiscordAlertIssue) {
  const addressLabel = issue.address_label?.trim();

  if (addressLabel) {
    return addressLabel;
  }

  return `${Number(issue.latitude).toFixed(6)}, ${Number(issue.longitude).toFixed(6)}`;
}

function buildIssueDetailUrl(issueId: string, appUrl: string) {
  return new URL(`/issues/${issueId}`, appUrl).toString();
}
