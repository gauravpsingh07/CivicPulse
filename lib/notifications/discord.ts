import "server-only";

import { getAppUrl } from "@/lib/supabase/env";
import {
  buildDiscordIssueAlertPayload,
  shouldSendHighPriorityIssueAlert,
  type DiscordAlertIssue,
} from "./discord-payload";

export type DiscordAlertResult =
  | { status: "sent"; errorMessage: null }
  | { status: "failed"; errorMessage: string }
  | { status: "skipped"; errorMessage: string };

export async function sendHighPriorityIssueAlert(
  issue: DiscordAlertIssue,
): Promise<DiscordAlertResult> {
  if (!shouldSendHighPriorityIssueAlert(issue)) {
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

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildDiscordIssueAlertPayload(issue, getAppUrl())),
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
