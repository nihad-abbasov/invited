/**
 * Client helpers for the Upstash-backed /api/events routes.
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
import { ensureUser } from "./session";
import { isAuthEnabled, isRemoteEventsEnabled, resetBackendStatusCache } from "./status";

export { isRemoteEventsEnabled };

/** Force a fresh status check (e.g. after env change in dev). */
export function resetRemoteEventsCache(): void {
  resetBackendStatusCache();
}

async function api<T>(path: string, init?: RequestInit): Promise<T | null> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (res.status === 503) return null;
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function listEvents(): Promise<InvitedEvent[] | null> {
  // In auth mode the server derives identity from the session; otherwise we
  // pass the local device user id.
  const query = (await isAuthEnabled())
    ? ""
    : `?userId=${encodeURIComponent(ensureUser().id)}`;
  return api<InvitedEvent[]>(`/api/events${query}`);
}

export async function getEvent(id: string): Promise<InvitedEvent | null> {
  return api<InvitedEvent>(`/api/events/${encodeURIComponent(id)}`);
}

export async function getEventByCode(code: string): Promise<InvitedEvent | null> {
  return api<InvitedEvent>(`/api/events/by-code/${encodeURIComponent(code)}`);
}

export async function importEvent(evt: InvitedEvent): Promise<InvitedEvent | null> {
  return api<InvitedEvent>("/api/events/import", {
    method: "POST",
    body: JSON.stringify(evt),
  });
}

export async function createEvent(input: CreateEventInput): Promise<InvitedEvent | null> {
  const user = (await isAuthEnabled()) ? undefined : ensureUser();
  return api<InvitedEvent>("/api/events", {
    method: "POST",
    body: JSON.stringify({ input, user }),
  });
}

export async function updateEvent(
  id: string,
  patch: Partial<CreateEventInput>,
): Promise<InvitedEvent | null> {
  return api<InvitedEvent>(`/api/events/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteEvent(id: string): Promise<boolean> {
  const res = await api<void>(`/api/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res !== null;
}

export async function setCoHosts(
  id: string,
  coHosts: { id: string; name: string }[],
): Promise<InvitedEvent | null> {
  return api<InvitedEvent>(`/api/events/${encodeURIComponent(id)}/cohosts`, {
    method: "PUT",
    body: JSON.stringify({ coHosts }),
  });
}

export async function setRsvp(
  eventId: string,
  user: User,
  status: RsvpStatus,
  opts?: { plusOnes?: number; note?: string },
): Promise<InvitedEvent | null> {
  return api<InvitedEvent>(`/api/events/${encodeURIComponent(eventId)}/rsvp`, {
    method: "PUT",
    body: JSON.stringify({ user, status, ...opts }),
  });
}

export async function postMessage(
  eventId: string,
  body: string,
  author: User,
): Promise<EventMessage | null> {
  return api<EventMessage>(`/api/events/${encodeURIComponent(eventId)}/messages`, {
    method: "POST",
    body: JSON.stringify({ body, author }),
  });
}

export async function addTrack(
  eventId: string,
  track: Omit<PlaylistTrack, "id">,
): Promise<PlaylistTrack | null> {
  return api<PlaylistTrack>(`/api/events/${encodeURIComponent(eventId)}/playlist`, {
    method: "POST",
    body: JSON.stringify(track),
  });
}

export async function removeTrack(eventId: string, trackId: string): Promise<boolean> {
  const res = await api<void>(
    `/api/events/${encodeURIComponent(eventId)}/playlist/${encodeURIComponent(trackId)}`,
    { method: "DELETE" },
  );
  return res !== null;
}

export async function addPhoto(
  eventId: string,
  photo: Omit<SharedAlbumPhoto, "id" | "createdAt">,
): Promise<SharedAlbumPhoto | null> {
  return api<SharedAlbumPhoto>(`/api/events/${encodeURIComponent(eventId)}/album`, {
    method: "POST",
    body: JSON.stringify(photo),
  });
}

export async function removePhoto(eventId: string, photoId: string): Promise<boolean> {
  const res = await api<void>(
    `/api/events/${encodeURIComponent(eventId)}/album/${encodeURIComponent(photoId)}`,
    { method: "DELETE" },
  );
  return res !== null;
}
