/**
 * Lightweight client-side "session".
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *  REPLACE-WITH-REAL-AUTH NOTE
 * ──────────────────────────────────────────────────────────────────────────────
 *  We deliberately skip iCloud/OAuth for now. Anyone — phone, tablet, laptop —
 *  can pick a display name and start hosting or RSVPing.
 *
 *  When you wire real auth:
 *    1. Swap `currentUser()` to hit `/api/me`.
 *    2. Replace `updateProfile()` with a PATCH /me.
 *    3. Keep the `User` shape stable so the UI doesn't change.
 *    4. Remove `localStorage` reads.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import type { User } from "../types";
import { readJSON, uid, writeJSON } from "../mock/storage";

const KEY = "invited.session.v1";

const PALETTE = ["#0a84ff", "#ff2d55", "#34c759", "#af52de", "#ff9500", "#5e5ce6", "#ff375f"];

function pickColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function currentUser(): User | null {
  return readJSON<User | null>(KEY, null);
}

export function ensureUser(): User {
  const existing = currentUser();
  if (existing) return existing;
  const u: User = {
    id: uid("user_"),
    name: "Guest",
    avatar: "G",
    color: PALETTE[0],
  };
  writeJSON(KEY, u);
  return u;
}

export function signIn(name: string): User {
  const trimmed = name.trim() || "Guest";
  const existing = currentUser();
  const user: User = {
    id: existing?.id ?? uid("user_"),
    name: trimmed,
    avatar: monogram(trimmed),
    color: pickColor(trimmed),
  };
  writeJSON(KEY, user);
  return user;
}

export function updateProfile(patch: Partial<Pick<User, "name" | "avatar" | "color">>): User {
  const cur = ensureUser();
  const next: User = {
    ...cur,
    ...patch,
    name: patch.name?.trim() || cur.name,
    avatar: patch.avatar || (patch.name ? monogram(patch.name) : cur.avatar),
    color: patch.color || cur.color,
  };
  writeJSON(KEY, next);
  return next;
}

export function signOut(): void {
  writeJSON<User | null>(KEY, null);
}
