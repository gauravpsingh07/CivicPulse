import "server-only";

import { getAppUrl } from "@/lib/supabase/env";
import type { Tables } from "@/lib/types/database";

export type DiscordAlertResult =
  | { status: "sent"; errorMessage: null }
  | { status: "failed"; errorMessage: string }
  | { status: "skipped"; errorMessage: string };

type AlertIssue = Pick<
  Tables<"issues">,
  | "id"
  | "title"
  | "description"
  | "category"
  | "urgency"
  | "latitude"
  | "longitude"
  | "address_label"
>;

export async function sendHighPriorityIssueAlert(
  issue: AlertIssue,
): Promise<DiscordAlertResult> {
  if (issue.urgency !== "high" && issue.urgency !== "critical") {
    return {
      status: "skipped",
      errorMessage: "Issue urgency does not require a Discord alert.",
    };
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return {
      status: "skipped",
      errorMessage: "DISCORD_WEBHOOK_URL is not configured.",
    };
  }

  const issueUrl = new URL(`/issues/${issue.id}`, getAppUrl()).toString();
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "CivicPulse",
        embeds: [
          {
            title: `${issue.urgency.toUpperCase()} issue: ${issue.title}`,
            url: issueUrl,
            description: issue.description.slice(0, 300),
            color: issue.urgency === "critical" ? 14444876 : 13734956,
            fields: [
              {
                name: "Category",
                value: issue.category,
                inline: true,
              },
              {
                name: "Location",
                value: `${issue.latitude}, ${issue.longitude}`,
                inline: true,
              },
              {
                name: "Address",
                value: issue.address_label || "Not provided",
                inline: false,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      return {
        status: "failed",
        errorMessage: `Discord webhook returned ${response.status}.`,
      };
    }
  } catch (error) {
    return {
      status: "failed",
      errorMessage:
        error instanceof Error
          ? error.message
          : "Discord webhook request failed.",
    };
  }

  return { status: "sent", errorMessage: null };
}
