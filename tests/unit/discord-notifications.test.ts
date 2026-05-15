import { describe, expect, it, vi } from "vitest";
import {
  buildDiscordIssueAlertPayload,
  getIssueAlertLocation,
  shouldSendHighPriorityIssueAlert,
} from "@/lib/notifications/discord-payload";
import { sendHighPriorityIssueAlert } from "@/lib/notifications/discord";
import type { DiscordAlertIssue } from "@/lib/notifications/discord-payload";

vi.mock("server-only", () => ({}));

const highIssue: DiscordAlertIssue = {
  id: "issue-123",
  title: "Signal light is down",
  description: "The signal light is out at a busy crossing near the school.",
  category: "streetlight",
  urgency: "high",
  status: "open",
  latitude: 40.7128,
  longitude: -74.006,
  address_label: "Main Street and 1st Avenue",
};

describe("Discord notification payload helpers", () => {
  it("builds the high-priority Discord payload with issue details", () => {
    const payload = buildDiscordIssueAlertPayload(
      highIssue,
      "https://civicpulse.example",
    );

    expect(payload.username).toBe("CivicPulse");
    expect(payload.content).toContain("New high-priority issue reported");
    expect(payload.embeds[0].title).toBe("New high-priority issue reported");
    expect(payload.embeds[0].url).toBe(
      "https://civicpulse.example/issues/issue-123",
    );
    expect(payload.embeds[0].fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Title", value: highIssue.title }),
        expect.objectContaining({ name: "Category", value: "Streetlight" }),
        expect.objectContaining({ name: "Urgency", value: "High" }),
        expect.objectContaining({ name: "Status", value: "Open" }),
        expect.objectContaining({
          name: "Location",
          value: "Main Street and 1st Avenue",
        }),
      ]),
    );
  });

  it("falls back to latitude and longitude when no address label exists", () => {
    expect(getIssueAlertLocation({ ...highIssue, address_label: null })).toBe(
      "40.712800, -74.006000",
    );
  });

  it("only marks high and critical issues as Discord alert candidates", () => {
    expect(shouldSendHighPriorityIssueAlert(highIssue)).toBe(true);
    expect(
      shouldSendHighPriorityIssueAlert({
        ...highIssue,
        urgency: "critical",
      }),
    ).toBe(true);
    expect(
      shouldSendHighPriorityIssueAlert({
        ...highIssue,
        urgency: "medium",
      }),
    ).toBe(false);
  });

  it("skips cleanly when the Discord webhook is missing", async () => {
    const originalWebhook = process.env.DISCORD_WEBHOOK_URL;
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    delete process.env.DISCORD_WEBHOOK_URL;

    await expect(sendHighPriorityIssueAlert(highIssue)).resolves.toEqual({
      status: "skipped",
      errorMessage: "DISCORD_WEBHOOK_URL is not configured.",
    });
    expect(fetchSpy).not.toHaveBeenCalled();

    if (originalWebhook) {
      process.env.DISCORD_WEBHOOK_URL = originalWebhook;
    }

    fetchSpy.mockRestore();
  });
});
