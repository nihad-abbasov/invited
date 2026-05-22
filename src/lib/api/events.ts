/**
 * Events API (mock).
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *  REPLACE-WITH-REAL-BACKEND NOTE
 * ──────────────────────────────────────────────────────────────────────────────
 *  Every exported function here corresponds 1:1 to an endpoint you'd build
 *  on a real server. Keep the function signatures, swap the bodies.
 *
 *  Suggested mapping:
 *    listEvents()             -> GET    /api/events?role=host|guest
 *    getEventByCode(code)     -> GET    /api/events/by-code/:code   (public)
 *    getEvent(id)             -> GET    /api/events/:id
 *    createEvent(input)       -> POST   /api/events
 *    updateEvent(id, patch)   -> PATCH  /api/events/:id
 *    deleteEvent(id)          -> DELETE /api/events/:id
 *    setRsvp(...)             -> PUT    /api/events/:id/rsvp
 *    postMessage(...)         -> POST   /api/events/:id/messages
 *    addTrack/removeTrack     -> POST/DELETE /api/events/:id/playlist
 *    addPhoto/removePhoto     -> POST/DELETE /api/events/:id/album
 *
 *  Photos in mock mode are stored as data: URLs in localStorage. On a real
 *  backend you'd POST them to S3 (pre-signed URL) and store only the URL.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import type {
  CreateEventInput,
  EventMessage,
  Guest,
  InvitedEvent,
  PlaylistTrack,
  RsvpStatus,
  SharedAlbumPhoto,
  User,
} from "../types";
import { buildSeedEvents } from "../mock/seed";
import { delay, readJSON, shortCode, uid, writeJSON } from "../mock/storage";
import { ensureUser } from "./session";

const KEY = "invited.events.v1";
const SEEDED_KEY = "invited.events.seeded.v1";

function readAll(): InvitedEvent[] {
  return readJSON<InvitedEvent[]>(KEY, []);
}

function writeAll(events: InvitedEvent[]): void {
  writeJSON(KEY, events);
}

function maybeSeed(): void {
  if (typeof window === "undefined") return;
  if (readJSON<boolean>(SEEDED_KEY, false)) return;
  const user = ensureUser();
  writeAll(buildSeedEvents(user));
  writeJSON(SEEDED_KEY, true);
}

export async function listEvents(): Promise<InvitedEvent[]> {
  maybeSeed();
  const user = ensureUser();
  const all = readAll();
  // Return events the user hosts or is a guest in. (Mock — server would scope.)
  const filtered = all.filter(
    (e) => e.hostId === user.id || e.guests.some((g) => g.user.id === user.id),
  );
  return delay(filtered.sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt)));
}

export async function getEvent(id: string): Promise<InvitedEvent | null> {
  maybeSeed();
  return delay(readAll().find((e) => e.id === id) ?? null);
}

export async function getEventByCode(code: string): Promise<InvitedEvent | null> {
  maybeSeed();
  const c = code.toUpperCase();
  return delay(readAll().find((e) => e.shortCode === c) ?? null);
}

export async function createEvent(input: CreateEventInput): Promise<InvitedEvent> {
  const user = ensureUser();
  const evt: InvitedEvent = {
    id: uid("evt_"),
    shortCode: shortCode(),
    title: input.title.trim(),
    description: input.description?.trim(),
    startAt: input.startAt,
    endAt: input.endAt,
    hostId: user.id,
    hostName: user.name,
    location: input.location,
    background: input.background,
    font: input.font,
    accent: input.accent,
    guests: [
      {
        id: uid("g_"),
        user,
        status: "going",
        plusOnes: 0,
        respondedAt: new Date().toISOString(),
      },
    ],
    messages: [],
    playlist: [],
    album: [],
    createdAt: new Date().toISOString(),
  };
  const all = readAll();
  all.unshift(evt);
  writeAll(all);
  return delay(evt, 280);
}

export async function updateEvent(
  id: string,
  patch: Partial<CreateEventInput>,
): Promise<InvitedEvent | null> {
  const all = readAll();
  const idx = all.findIndex((e) => e.id === id);
  if (idx === -1) return delay(null);
  all[idx] = { ...all[idx], ...patch };
  writeAll(all);
  return delay(all[idx]);
}

export async function deleteEvent(id: string): Promise<void> {
  writeAll(readAll().filter((e) => e.id !== id));
  return delay(undefined);
}

export async function setRsvp(
  eventId: string,
  user: User,
  status: RsvpStatus,
  opts?: { plusOnes?: number; note?: string },
): Promise<InvitedEvent | null> {
  const all = readAll();
  const idx = all.findIndex((e) => e.id === eventId);
  if (idx === -1) return delay(null);
  const evt = all[idx];
  const existing = evt.guests.find((g) => g.user.id === user.id);
  if (existing) {
    existing.status = status;
    existing.respondedAt = new Date().toISOString();
    if (opts?.plusOnes !== undefined) existing.plusOnes = opts.plusOnes;
    if (opts?.note !== undefined) existing.note = opts.note;
    // Keep latest name/avatar/color in sync if the user changed their profile.
    existing.user = user;
  } else {
    const g: Guest = {
      id: uid("g_"),
      user,
      status,
      plusOnes: opts?.plusOnes ?? 0,
      note: opts?.note,
      respondedAt: new Date().toISOString(),
    };
    evt.guests.push(g);
  }
  writeAll(all);
  return delay(evt);
}

export async function postMessage(
  eventId: string,
  body: string,
  author: User,
): Promise<EventMessage | null> {
  const all = readAll();
  const evt = all.find((e) => e.id === eventId);
  if (!evt) return delay(null);
  const msg: EventMessage = {
    id: uid("m_"),
    authorId: author.id,
    authorName: author.name,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  evt.messages.unshift(msg);
  writeAll(all);
  return delay(msg);
}

export async function addTrack(
  eventId: string,
  track: Omit<PlaylistTrack, "id">,
): Promise<PlaylistTrack | null> {
  const all = readAll();
  const evt = all.find((e) => e.id === eventId);
  if (!evt) return delay(null);
  const t: PlaylistTrack = { id: uid("t_"), ...track };
  evt.playlist.push(t);
  writeAll(all);
  return delay(t);
}

export async function removeTrack(eventId: string, trackId: string): Promise<void> {
  const all = readAll();
  const evt = all.find((e) => e.id === eventId);
  if (!evt) return delay(undefined);
  evt.playlist = evt.playlist.filter((t) => t.id !== trackId);
  writeAll(all);
  return delay(undefined);
}

export async function addPhoto(
  eventId: string,
  photo: Omit<SharedAlbumPhoto, "id" | "createdAt">,
): Promise<SharedAlbumPhoto | null> {
  const all = readAll();
  const evt = all.find((e) => e.id === eventId);
  if (!evt) return delay(null);
  const p: SharedAlbumPhoto = {
    id: uid("p_"),
    createdAt: new Date().toISOString(),
    ...photo,
  };
  evt.album.unshift(p);
  writeAll(all);
  return delay(p);
}

export async function removePhoto(eventId: string, photoId: string): Promise<void> {
  const all = readAll();
  const evt = all.find((e) => e.id === eventId);
  if (!evt) return delay(undefined);
  evt.album = evt.album.filter((p) => p.id !== photoId);
  writeAll(all);
  return delay(undefined);
}
