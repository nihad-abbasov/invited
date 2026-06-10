/**
 * Canonical public base URL for the app. Used for share links, QR codes, and
 * Open Graph metadata so they always point at the deployed site rather than
 * whatever origin the page happens to be served from (e.g. localhost in dev).
 *
 * Override per-environment with NEXT_PUBLIC_SITE_URL; otherwise defaults to the
 * production Vercel deployment.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://invited-az.vercel.app"
).replace(/\/$/, "");

/** Absolute, shareable URL for a public invite by its short code. */
export function inviteUrl(shortCode: string): string {
  return `${SITE_URL}/i/${shortCode}`;
}
