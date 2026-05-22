"use client";

import { MapPin } from "lucide-react";
import type { EventLocation } from "@/lib/types";

/**
 * Stylized, dependency-free map preview.
 *
 * REPLACE-WITH-REAL-MAPS NOTE:
 *  Swap for Apple Maps via MapKit JS, Mapbox GL, or Google Maps Embed.
 *  Then pass `lat`/`lng` from the event location.
 */
export function MapPreview({ location }: { location: EventLocation }) {
  const href = `https://maps.google.com/?q=${encodeURIComponent(
    [location.name, location.address].filter(Boolean).join(", "),
  )}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded-[var(--radius-md)] overflow-hidden hairline tap-spring"
    >
      <div className="relative h-32 sm:h-36 w-full">
        {/* Stylized "map" pattern using gradients + grid */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #e7f1ff 0%, #f3eaff 50%, #ffeef3 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(10,132,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(10,132,255,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Fake roads */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
          <path d="M0 90 Q 80 60, 160 88 T 320 92 T 400 80" stroke="rgba(10,132,255,0.55)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M70 0 Q 80 60, 60 110 T 80 160" stroke="rgba(94,92,230,0.45)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M300 0 Q 280 80, 320 160" stroke="rgba(175,82,222,0.45)" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
        {/* Pin */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <div className="relative">
            <div
              className="h-10 w-10 rounded-full grid place-items-center text-white shadow-[0_8px_24px_-6px_rgba(255,45,85,0.6)]"
              style={{ background: "linear-gradient(155deg, #ff375f, #ff2d55)" }}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-2 w-2 rotate-45 bg-[#ff2d55]" />
          </div>
        </div>
      </div>
      <div className="bg-[var(--surface)] px-4 py-2.5">
        <div className="text-sm font-medium truncate">{location.name}</div>
        {location.address && (
          <div className="text-xs text-[var(--foreground-secondary)] truncate">
            {location.address}
          </div>
        )}
      </div>
    </a>
  );
}
