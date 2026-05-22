/**
 * Tiny localStorage wrapper used by the mock backend.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *  REPLACE-WITH-REAL-BACKEND NOTE
 * ──────────────────────────────────────────────────────────────────────────────
 *  In production this whole file goes away. The functions in
 *  `src/lib/api/*` should call your real HTTP endpoints (REST/GraphQL/tRPC).
 *  Everything here is intentionally synchronous-ish via Promises so the call
 *  sites already look "remote".
 * ──────────────────────────────────────────────────────────────────────────────
 */

const isBrowser = typeof window !== "undefined";

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded etc. — swallow in mock layer.
  }
}

export function removeKey(key: string): void {
  if (!isBrowser) return;
  window.localStorage.removeItem(key);
}

/** Simulate network latency so loading states are visible during development. */
export function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

/** Crypto-quality id, falls back when crypto.randomUUID isn't available. */
export function uid(prefix = ""): string {
  if (isBrowser && "crypto" in window && "randomUUID" in window.crypto) {
    return prefix + window.crypto.randomUUID();
  }
  return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Short, friendly share code: 6 chars, no ambiguous glyphs. */
export function shortCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}
