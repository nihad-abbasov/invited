"use client";

import { MapPin, CalendarDays, Clock } from "lucide-react";
import { backgroundToCSS, fontStyle } from "@/lib/design";
import { formatEventDate } from "@/lib/format";
import type { EventBackground, EventFontPreset, EventLocation } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  title: string;
  hostName: string;
  startAt: string;
  background: EventBackground;
  font: EventFontPreset;
  location?: EventLocation;
  description?: string;
  className?: string;
  /** Slight float animation, used on hero/preview. */
  floating?: boolean;
}

export function InvitationCard({
  title,
  hostName,
  startAt,
  background,
  font,
  location,
  description,
  className,
  floating,
}: Props) {
  const { weekday, date, time } = formatEventDate(startAt);
  const showEmoji = background.kind === "emoji";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] aspect-[3/4] w-full",
        "shadow-[var(--shadow-card)] text-white",
        floating && "animate-[float-up_700ms_var(--ease-spring)_both]",
        className,
      )}
      style={backgroundToCSS(background)}
    >
      {/* Decorative emoji halo */}
      {showEmoji && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div
            className="text-[18rem] leading-none opacity-90 drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
            style={{ filter: "saturate(110%)" }}
          >
            {background.emoji}
          </div>
        </div>
      )}

      {/* Bottom gradient + content */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 space-y-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
        <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">
          Hosted by {hostName}
        </div>
        <h2
          className="text-3xl sm:text-4xl font-semibold leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
          style={fontStyle(font)}
        >
          {title || "Your event"}
        </h2>
        {description && (
          <p className="text-sm opacity-90 line-clamp-2">{description}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {weekday}, {date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {time}
          </span>
          {location?.name && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {location.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
