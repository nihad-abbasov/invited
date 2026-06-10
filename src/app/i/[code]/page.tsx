import type { Metadata } from "next";
import { PublicInvite } from "./PublicInvite";

/**
 * Rich link preview metadata for shared invitations.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *  NOTE: per-event previews need a server-readable backend.
 * ──────────────────────────────────────────────────────────────────────────────
 *  In mock mode events live in the browser's localStorage, so the server (and
 *  social scrapers like iMessage / WhatsApp / Slack) cannot read the event
 *  title or date here. We therefore ship a polished, branded generic preview.
 *
 *  Once `getEventByCode` talks to a real backend, fetch the event in
 *  `generateMetadata` and in `opengraph-image.tsx` to make the preview
 *  event-specific (title, date, host) — the wiring is already in place.
 * ──────────────────────────────────────────────────────────────────────────────
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const title = "You're invited";
  const description = "Tap to see the details, RSVP, and bring the good vibes.";
  return {
    title,
    description,
    openGraph: {
      title: `${title} — Invited`,
      description,
      type: "website",
      url: `/i/${code}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Invited`,
      description,
    },
  };
}

export default async function PublicInvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <PublicInvite code={code} />;
}
