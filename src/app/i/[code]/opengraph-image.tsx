import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og";

export const alt = "You're invited — open to see the details and RSVP";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Branded social card for shared invitations.
 *
 * Generic by design: in mock mode the event itself lives in localStorage and
 * isn't readable on the server. When a real backend lands, `await params` here
 * to fetch the event by code and render its title/date/host.
 */
export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff7ab8 0%, #7a5cff 55%, #0a84ff 100%)",
          color: "white",
          fontFamily: "Inter",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 30,
            fontWeight: 700,
            opacity: 0.95,
            letterSpacing: -0.5,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(255,255,255,0.95)",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 999,
                background: "linear-gradient(135deg, #ff7ab8, #7a5cff)",
              }}
            />
          </div>
          Invited
        </div>

        <div
          style={{
            fontSize: 104,
            fontWeight: 700,
            letterSpacing: -3,
            marginTop: 28,
            textShadow: "0 6px 30px rgba(0,0,0,0.18)",
          }}
        >
          You&apos;re invited
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: 400,
            opacity: 0.92,
            marginTop: 8,
          }}
        >
          Tap to see the details &amp; RSVP
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
