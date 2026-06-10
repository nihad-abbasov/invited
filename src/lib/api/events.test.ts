import { describe, expect, it } from "vitest";
import { isOrganizer } from "./events";
import type { InvitedEvent } from "../types";

function makeEvent(overrides: Partial<InvitedEvent> = {}): InvitedEvent {
  return {
    id: "evt_1",
    shortCode: "AB12CD",
    title: "Test",
    startAt: new Date().toISOString(),
    hostId: "user_host",
    hostName: "Host",
    background: { kind: "emoji", emoji: "🎉", gradient: ["#fff", "#000"] },
    font: "display",
    accent: "#0a84ff",
    guests: [],
    messages: [],
    playlist: [],
    album: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("isOrganizer", () => {
  it("is true for the primary host", () => {
    expect(isOrganizer(makeEvent(), "user_host")).toBe(true);
  });

  it("is true for a co-host", () => {
    const evt = makeEvent({ coHosts: [{ id: "user_co", name: "Co" }] });
    expect(isOrganizer(evt, "user_co")).toBe(true);
  });

  it("is false for an ordinary guest", () => {
    const evt = makeEvent({ coHosts: [{ id: "user_co", name: "Co" }] });
    expect(isOrganizer(evt, "user_guest")).toBe(false);
  });

  it("is false when the user id is undefined", () => {
    expect(isOrganizer(makeEvent(), undefined)).toBe(false);
  });
});
