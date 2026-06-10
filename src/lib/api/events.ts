/**
 * Events API — uses Upstash Redis on the server when configured,
 * otherwise falls back to browser localStorage.
 */

import type {
  CreateEventInput,
  EventMessage,
  InvitedEvent,
  PlaylistTrack,
  RsvpStatus,
  SharedAlbumPhoto,
  User,
} from "../types";
import * as local from "./eventsLocal";
import * as remote from "./remoteEvents";

export { isRemoteEventsEnabled, resetRemoteEventsCache } from "./remoteEvents";

/** True if the user is the host or a co-host (can edit / manage the event). */
export function isOrganizer(event: InvitedEvent, userId: string | undefined): boolean {
  if (!userId) return false;
  return event.hostId === userId || !!event.coHosts?.some((c) => c.id === userId);
}

async function preferRemote<T>(
  remoteFn: () => Promise<T | null>,
  localFn: () => Promise<T>,
): Promise<T> {
  if (await remote.isRemoteEventsEnabled()) {
    const result = await remoteFn();
    if (result !== null) return result;
  }
  return localFn();
}

export async function listEvents(): Promise<InvitedEvent[]> {
  return preferRemote(() => remote.listEvents(), () => local.listEvents());
}

export async function getEvent(id: string): Promise<InvitedEvent | null> {
  return preferRemote(() => remote.getEvent(id), () => local.getEvent(id));
}

export async function getEventByCode(code: string): Promise<InvitedEvent | null> {
  return preferRemote(() => remote.getEventByCode(code), () => local.getEventByCode(code));
}

export async function importEvent(evt: InvitedEvent): Promise<InvitedEvent> {
  if (await remote.isRemoteEventsEnabled()) {
    const saved = await remote.importEvent(evt);
    if (saved) return saved;
  }
  return local.importEvent(evt);
}

export async function createEvent(input: CreateEventInput): Promise<InvitedEvent> {
  if (await remote.isRemoteEventsEnabled()) {
    const evt = await remote.createEvent(input);
    if (evt) return evt;
  }
  return local.createEvent(input);
}

export async function updateEvent(
  id: string,
  patch: Partial<CreateEventInput>,
): Promise<InvitedEvent | null> {
  return preferRemote(() => remote.updateEvent(id, patch), () => local.updateEvent(id, patch));
}

export async function deleteEvent(id: string): Promise<void> {
  if (await remote.isRemoteEventsEnabled()) {
    const ok = await remote.deleteEvent(id);
    if (ok) return;
  }
  return local.deleteEvent(id);
}

export async function setCoHosts(
  id: string,
  coHosts: { id: string; name: string }[],
): Promise<InvitedEvent | null> {
  return preferRemote(
    () => remote.setCoHosts(id, coHosts),
    () => local.setCoHosts(id, coHosts),
  );
}

export async function setRsvp(
  eventId: string,
  user: User,
  status: RsvpStatus,
  opts?: { plusOnes?: number; note?: string },
): Promise<InvitedEvent | null> {
  return preferRemote(
    () => remote.setRsvp(eventId, user, status, opts),
    () => local.setRsvp(eventId, user, status, opts),
  );
}

export async function postMessage(
  eventId: string,
  body: string,
  author: User,
): Promise<EventMessage | null> {
  return preferRemote(
    () => remote.postMessage(eventId, body, author),
    () => local.postMessage(eventId, body, author),
  );
}

export async function addTrack(
  eventId: string,
  track: Omit<PlaylistTrack, "id">,
): Promise<PlaylistTrack | null> {
  return preferRemote(
    () => remote.addTrack(eventId, track),
    () => local.addTrack(eventId, track),
  );
}

export async function removeTrack(eventId: string, trackId: string): Promise<void> {
  if (await remote.isRemoteEventsEnabled()) {
    const ok = await remote.removeTrack(eventId, trackId);
    if (ok) return;
  }
  return local.removeTrack(eventId, trackId);
}

export async function addPhoto(
  eventId: string,
  photo: Omit<SharedAlbumPhoto, "id" | "createdAt">,
): Promise<SharedAlbumPhoto | null> {
  return preferRemote(
    () => remote.addPhoto(eventId, photo),
    () => local.addPhoto(eventId, photo),
  );
}

export async function removePhoto(eventId: string, photoId: string): Promise<void> {
  if (await remote.isRemoteEventsEnabled()) {
    const ok = await remote.removePhoto(eventId, photoId);
    if (ok) return;
  }
  return local.removePhoto(eventId, photoId);
}
