import { describe, it, expect } from "vitest";
import { buildInviteUrl, decodeInviteHash } from "./inviteShare";
import type { InvitedEvent } from "./types";

const baseEvent: InvitedEvent = {
  id: "evt_test_123",
  shortCode: "AB12CD",
  title: "Rooftop Birthday",
  description: "Bring good vibes (and a sweater).",
  startAt: "2026-06-16T19:00:00.000Z",
  endAt: "2026-06-16T23:00:00.000Z",
  hostId: "user_host_1",
  hostName: "Olivia Bennett",
  coHosts: [{ id: "user_2", name: "Sam" }],
  location: { name: "The Skyline Loft", address: "212 Mercer St, New York, NY" },
  background: { kind: "emoji", emoji: "🎂", gradient: ["#ff7a59", "#ff2d92"] },
  font: "display",
  accent: "#0a84ff",
  guests: [],
  messages: [],
  playlist: [],
  album: [],
  createdAt: "2026-06-01T12:00:00.000Z",
};

describe("inviteShare", () => {
  it("round-trips the event display fields through the URL hash", () => {
    const url = buildInviteUrl(baseEvent);
    expect(url).toContain("/i/AB12CD#i=");

    const hash = "#" + url.split("#")[1];
    const decoded = decodeInviteHash(hash);
    expect(decoded).not.toBeNull();
    expect(decoded!.id).toBe(baseEvent.id);
    expect(decoded!.shortCode).toBe(baseEvent.shortCode);
    expect(decoded!.title).toBe(baseEvent.title);
    expect(decoded!.description).toBe(baseEvent.description);
    expect(decoded!.startAt).toBe(baseEvent.startAt);
    expect(decoded!.endAt).toBe(baseEvent.endAt);
    expect(decoded!.hostName).toBe(baseEvent.hostName);
    expect(decoded!.location).toEqual(baseEvent.location);
    expect(decoded!.background).toEqual(baseEvent.background);
    expect(decoded!.coHosts).toEqual(baseEvent.coHosts);
  });

  it("seeds the host as a going guest on the imported copy", () => {
    const decoded = decodeInviteHash("#" + buildInviteUrl(baseEvent).split("#")[1]);
    expect(decoded!.guests).toHaveLength(1);
    expect(decoded!.guests[0].status).toBe("going");
    expect(decoded!.guests[0].user.name).toBe("Olivia Bennett");
  });

  it("drops inline photo backgrounds to keep the URL small", () => {
    const withPhoto: InvitedEvent = {
      ...baseEvent,
      background: { kind: "photo", src: "data:image/png;base64,AAAA" },
    };
    const decoded = decodeInviteHash("#" + buildInviteUrl(withPhoto).split("#")[1]);
    expect(decoded!.background.kind).toBe("color");
  });

  it("returns null for non-invite or malformed hashes", () => {
    expect(decodeInviteHash("")).toBeNull();
    expect(decodeInviteHash("#")).toBeNull();
    expect(decodeInviteHash("#section-2")).toBeNull();
    expect(decodeInviteHash("#i=not-valid-base64-$$$")).toBeNull();
  });
});
