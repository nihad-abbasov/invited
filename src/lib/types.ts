/**
 * Domain types for Invited.
 *
 * These mirror what a real REST/GraphQL API would return.
 * When swapping in a real backend (see `src/lib/api/*`), keep these shapes stable
 * so the UI layer doesn't need to change.
 */

export type EventBackground =
  | { kind: "emoji"; emoji: string; gradient: [string, string] }
  | { kind: "color"; gradient: [string, string] }
  | { kind: "photo"; /** data: URL or remote URL */ src: string };

export type RsvpStatus = "going" | "maybe" | "declined" | "pending";

export interface User {
  /** Stable local id (uuid). Replace with backend user id when real auth lands. */
  id: string;
  name: string;
  /** Optional 1-2 char monogram or emoji. */
  avatar?: string;
  /** Color used for the monogram chip background. */
  color: string;
}

export interface Guest {
  id: string;
  user: User;
  status: RsvpStatus;
  /** ISO timestamp of last status change. */
  respondedAt?: string;
  plusOnes: number;
  note?: string;
}

export interface EventMessage {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string; // ISO
}

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  /** Whoever added it. */
  addedBy: string;
  durationMs: number;
  /** Optional artwork (data: URL, http URL, or emoji fallback). */
  artwork?: string;
}

export interface SharedAlbumPhoto {
  id: string;
  /** data: URL in mock mode, S3/CloudFront URL in prod. */
  src: string;
  uploadedBy: string;
  caption?: string;
  createdAt: string; // ISO
}

export interface EventLocation {
  /** Human readable, e.g. "Apple Park, Cupertino". */
  name: string;
  /** Optional 2nd line. */
  address?: string;
  /** Optional coordinates for map preview (mock). */
  lat?: number;
  lng?: number;
}

export interface WeatherForecast {
  /** e.g. "Sunny", "Partly Cloudy". */
  condition: string;
  /** Lucide icon name we map to in <WeatherBadge />. */
  icon: "sun" | "cloud" | "cloud-rain" | "cloud-snow" | "cloud-sun" | "wind" | "moon";
  /** High/Low in °C. */
  high: number;
  low: number;
}

export type EventFontPreset =
  | "display" // Fraunces — expressive variable serif (default for invitations)
  | "rounded" // Quicksand — friendly geometric rounded
  | "script" // Caveat — handwritten save-the-date feel
  | "mono"; // Geist Mono — modern monospace

export interface InvitedEvent {
  id: string;
  /** Public short code used for the share link, e.g. /i/AB12CD. */
  shortCode: string;
  title: string;
  description?: string;
  /** ISO timestamp. */
  startAt: string;
  /** ISO timestamp. Optional. */
  endAt?: string;
  /** Host's user id. */
  hostId: string;
  hostName: string;
  /**
   * Additional hosts who can edit the event and manage guests.
   * Promoted from the guest list by the primary host.
   */
  coHosts?: Pick<User, "id" | "name">[];
  location?: EventLocation;
  background: EventBackground;
  font: EventFontPreset;
  /** Tag color used for chips and the create-screen accent. */
  accent: string;
  guests: Guest[];
  messages: EventMessage[];
  playlist: PlaylistTrack[];
  album: SharedAlbumPhoto[];
  /** Created at ISO. */
  createdAt: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  startAt: string;
  endAt?: string;
  location?: EventLocation;
  background: EventBackground;
  font: EventFontPreset;
  accent: string;
}
