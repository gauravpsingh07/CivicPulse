import { describe, expect, it } from "vitest";
import {
  getResolvedAtForStatusTransition,
  shouldWriteStatusHistory,
} from "@/lib/admin/status-transitions";

const now = new Date("2026-05-15T12:00:00.000Z");

describe("admin status transition helpers", () => {
  it("sets resolved_at when moving to resolved or closed", () => {
    expect(
      getResolvedAtForStatusTransition({
        nextStatus: "resolved",
        previousResolvedAt: null,
        now,
      }),
    ).toBe("2026-05-15T12:00:00.000Z");

    expect(
      getResolvedAtForStatusTransition({
        nextStatus: "closed",
        previousResolvedAt: "2026-05-14T10:00:00.000Z",
        now,
      }),
    ).toBe("2026-05-14T10:00:00.000Z");
  });

  it("clears resolved_at when reopened to open or in progress", () => {
    expect(
      getResolvedAtForStatusTransition({
        nextStatus: "open",
        previousResolvedAt: "2026-05-14T10:00:00.000Z",
        now,
      }),
    ).toBeNull();

    expect(
      getResolvedAtForStatusTransition({
        nextStatus: "in_progress",
        previousResolvedAt: "2026-05-14T10:00:00.000Z",
        now,
      }),
    ).toBeNull();
  });

  it("preserves resolved_at for duplicate or rejected moderation states", () => {
    expect(
      getResolvedAtForStatusTransition({
        nextStatus: "duplicate",
        previousResolvedAt: "2026-05-14T10:00:00.000Z",
        now,
      }),
    ).toBe("2026-05-14T10:00:00.000Z");
  });

  it("writes history only for real status changes", () => {
    expect(shouldWriteStatusHistory("open", "in_progress")).toBe(true);
    expect(shouldWriteStatusHistory("open", "open")).toBe(false);
  });
});
