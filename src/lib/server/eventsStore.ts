/**
 * Server-side event persistence in Upstash Redis.
 *
 * Key layout:
 *   evt:{id}           -> InvitedEvent JSON
 *   code:{SHORT_CODE}  -> event id
 *   user:{userId}      -> Set of event ids (host + guest memberships)
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
} from "@/lib/types";
import { getRedis } from "@/lib/redis/client";
import { shortCode, uid } from "@/lib/server/ids";

const EVT = (id: string) => `evt:${id}`;
const CODE = (code: string) => `code:${code.toUpperCase()}`;
const USER = (userId: string) => `user:${userId}`;

async function saveEvent(evt: InvitedEvent): Promise<void> {
  const redis = getRedis();
  await redis.set(EVT(evt.id), evt);
  await redis.set(CODE(evt.shortCode), evt.id);
}

async function trackUserEvent(userId: string, eventId: string): Promise<void> {
  await getRedis().sadd(USER(userId), eventId);
}

async function getEventById(id: string): Promise<InvitedEvent | null> {
  return (await getRedis().get<InvitedEvent>(EVT(id))) ?? null;
}

export async function listEventsForUser(userId: string): Promise<InvitedEvent[]> {
  const redis = getRedis();
  const ids = (await redis.smembers(USER(userId))) as string[];
  if (!ids?.length) return [];
  const events = await Promise.all(ids.map((id) => redis.get<InvitedEvent>(EVT(id))));
  return events
    .filter((e): e is InvitedEvent => !!e)
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
}

export async function getEvent(id: string): Promise<InvitedEvent | null> {
  return getEventById(id);
}

export async function getEventByCode(code: string): Promise<InvitedEvent | null> {
  const redis = getRedis();
  const id = await redis.get<string>(CODE(code));
  if (!id) return null;
  return getEventById(id);
}

export async function importEvent(evt: InvitedEvent): Promise<InvitedEvent> {
  const existing = await getEventById(evt.id);
  if (existing) return existing;
  await saveEvent(evt);
  await trackUserEvent(evt.hostId, evt.id);
  return evt;
}

export async function createEvent(
  input: CreateEventInput,
  user: User,
): Promise<InvitedEvent> {
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
  await saveEvent(evt);
  await trackUserEvent(user.id, evt.id);
  return evt;
}

export async function updateEvent(
  id: string,
  patch: Partial<CreateEventInput>,
): Promise<InvitedEvent | null> {
  const evt = await getEventById(id);
  if (!evt) return null;
  const next = { ...evt, ...patch };
  await saveEvent(next);
  return next;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const redis = getRedis();
  const evt = await getEventById(id);
  if (!evt) return false;
  await redis.del(EVT(id), CODE(evt.shortCode));
  await redis.srem(USER(evt.hostId), id);
  for (const g of evt.guests) {
    await redis.srem(USER(g.user.id), id);
  }
  return true;
}

export async function setCoHosts(
  id: string,
  coHosts: { id: string; name: string }[],
): Promise<InvitedEvent | null> {
  const evt = await getEventById(id);
  if (!evt) return null;
  const next = { ...evt, coHosts };
  await saveEvent(next);
  return next;
}

export async function setRsvp(
  eventId: string,
  user: User,
  status: RsvpStatus,
  opts?: { plusOnes?: number; note?: string },
): Promise<InvitedEvent | null> {
  const evt = await getEventById(eventId);
  if (!evt) return null;
  const existing = evt.guests.find((g) => g.user.id === user.id);
  if (existing) {
    existing.status = status;
    existing.respondedAt = new Date().toISOString();
    if (opts?.plusOnes !== undefined) existing.plusOnes = opts.plusOnes;
    if (opts?.note !== undefined) existing.note = opts.note;
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
  await saveEvent(evt);
  await trackUserEvent(user.id, eventId);
  return evt;
}

export async function postMessage(
  eventId: string,
  body: string,
  author: User,
): Promise<EventMessage | null> {
  const evt = await getEventById(eventId);
  if (!evt) return null;
  const msg: EventMessage = {
    id: uid("m_"),
    authorId: author.id,
    authorName: author.name,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  evt.messages.unshift(msg);
  await saveEvent(evt);
  return msg;
}

export async function addTrack(
  eventId: string,
  track: Omit<PlaylistTrack, "id">,
): Promise<PlaylistTrack | null> {
  const evt = await getEventById(eventId);
  if (!evt) return null;
  const t: PlaylistTrack = { id: uid("t_"), ...track };
  evt.playlist.push(t);
  await saveEvent(evt);
  return t;
}

export async function removeTrack(eventId: string, trackId: string): Promise<boolean> {
  const evt = await getEventById(eventId);
  if (!evt) return false;
  evt.playlist = evt.playlist.filter((t) => t.id !== trackId);
  await saveEvent(evt);
  return true;
}

export async function addPhoto(
  eventId: string,
  photo: Omit<SharedAlbumPhoto, "id" | "createdAt">,
): Promise<SharedAlbumPhoto | null> {
  const evt = await getEventById(eventId);
  if (!evt) return null;
  const p: SharedAlbumPhoto = {
    id: uid("p_"),
    createdAt: new Date().toISOString(),
    ...photo,
  };
  evt.album.unshift(p);
  await saveEvent(evt);
  return p;
}

export async function removePhoto(eventId: string, photoId: string): Promise<boolean> {
  const evt = await getEventById(eventId);
  if (!evt) return false;
  evt.album = evt.album.filter((p) => p.id !== photoId);
  await saveEvent(evt);
  return true;
}
