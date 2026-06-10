/**
 * Self-contained invite links.
 *
 * Because this app has no shared backend (events live in each browser's
 * localStorage), a plain link can't be opened on another device — the data
 * simply isn't there. To make share links / QR codes work cross-device without
 * a server, we pack the event's display details into the URL hash. The public
 * invite page decodes that payload and imports a local copy so it renders.
 *
 * Trade-off: a guest's RSVP stays on the guest's device (there's still no
 * server to sync it back to the host). The invitation itself, however, opens
 * anywhere. The payload is kept small (no photos/messages/guest list), so the
 * resulting URL stays within comfortable QR-code limits.
 */

import type { InvitedEvent } from "./types";
import { SITE_URL } from "./siteUrl";

/** Compact, short-keyed shape to keep the encoded URL small. */
interface Packed {
  i: string; // id
  c: string; // shortCode
  t: string; // title
  d?: string; // description
  s: string; // startAt
  e?: string; // endAt
  hn: string; // hostName
  hi: string; // hostId
  l?: InvitedEvent["location"];
  b: InvitedEvent["background"];
  f: InvitedEvent["font"];
  a: string; // accent
  ch?: InvitedEvent["coHosts"];
  ca: string; // createdAt
}

const HASH_PREFIX = "i=";

function encodeBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function pack(evt: InvitedEvent): Packed {
  // Drop heavy inline photo backgrounds (data: URLs) — they'd blow past QR
  // limits. Fall back to a gradient using the event accent.
  let background = evt.background;
  if (background.kind === "photo" && background.src.startsWith("data:")) {
    background = { kind: "color", gradient: [evt.accent, evt.accent] };
  }
  return {
    i: evt.id,
    c: evt.shortCode,
    t: evt.title,
    d: evt.description,
    s: evt.startAt,
    e: evt.endAt,
    hn: evt.hostName,
    hi: evt.hostId,
    l: evt.location,
    b: background,
    f: evt.font,
    a: evt.accent,
    ch: evt.coHosts,
    ca: evt.createdAt,
  };
}

function unpack(p: Packed): InvitedEvent {
  return {
    id: p.i,
    shortCode: p.c,
    title: p.t,
    description: p.d,
    startAt: p.s,
    endAt: p.e,
    hostId: p.hi,
    hostName: p.hn,
    coHosts: p.ch,
    location: p.l,
    background: p.b,
    font: p.f,
    accent: p.a,
    // Seed the host as attending so counts/avatars look right. The rest is
    // empty — this device only has the shared snapshot, not live activity.
    guests: [
      {
        id: `g_host_${p.hi}`,
        user: { id: p.hi, name: p.hn, color: p.a },
        status: "going",
        plusOnes: 0,
        respondedAt: p.ca,
      },
    ],
    messages: [],
    playlist: [],
    album: [],
    createdAt: p.ca,
  };
}

/**
 * Absolute invite URL.
 * - With Redis: short link only (`/i/CODE`) — the server has the event.
 * - Without Redis: self-contained link with event data in the hash.
 */
export function buildInviteUrl(evt: InvitedEvent, opts?: { remote?: boolean }): string {
  const base = `${SITE_URL}/i/${evt.shortCode}`;
  if (opts?.remote) return base;
  try {
    return `${base}#${HASH_PREFIX}${encodeBase64Url(JSON.stringify(pack(evt)))}`;
  } catch {
    return base;
  }
}

/** Parse an event payload out of a URL hash (e.g. `#i=...`). */
export function decodeInviteHash(hash: string): InvitedEvent | null {
  const raw = hash.replace(/^#/, "");
  if (!raw.startsWith(HASH_PREFIX)) return null;
  try {
    const json = decodeBase64Url(raw.slice(HASH_PREFIX.length));
    const parsed = JSON.parse(json) as Packed;
    if (!parsed?.i || !parsed?.t || !parsed?.s) return null;
    return unpack(parsed);
  } catch {
    return null;
  }
}
