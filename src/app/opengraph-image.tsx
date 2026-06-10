import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og";

export const alt = "Invited — create beautiful invitations and manage RSVPs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          justifyContent: "center",
          padding: "0 96px",
          background: "linear-gradient(135deg, #0b0b0f 0%, #16121f 60%, #1b1430 100%)",
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
            opacity: 0.9,
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
              background: "linear-gradient(135deg, #ff7ab8, #7a5cff)",
            }}
          >
            <div style={{ width: 22, height: 22, borderRadius: 999, background: "white", opacity: 0.95 }} />
          </div>
          Invited
        </div>

        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: -3,
            marginTop: 36,
            lineHeight: 1.05,
            maxWidth: 900,
            background: "linear-gradient(90deg, #ffffff, #d9c8ff)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Bring people together.
        </div>

        <div style={{ fontSize: 34, fontWeight: 400, opacity: 0.78, marginTop: 20, maxWidth: 820 }}>
          Create beautiful invitations, manage RSVPs, share a playlist and a photo album. No app required.
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
