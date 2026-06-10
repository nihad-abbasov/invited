"use client";

import { MapPin, CalendarDays, Clock } from "lucide-react";
import { backgroundToCSS, fontStyle } from "@/lib/design";
import { formatEventDate } from "@/lib/format";
import type { EventBackground, EventFontPreset, EventLocation } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
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
  floating?: boolean;
  /** Scaled-down styling for thumbnail/grid contexts (e.g. the home page). */
  compact?: boolean;
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
  compact = false,
}: Props) {
  const { weekday, date, time } = formatEventDate(startAt);
  const showEmoji = background.kind === "emoji";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl aspect-[3/4] w-full",
        "shadow-(--shadow-card) text-white",
        floating && "animate-[float-up_700ms_var(--ease-spring)_both]",
        className,
      )}
      style={backgroundToCSS(background)}
    >
      {showEmoji && (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div
            className={cn(
              "leading-none opacity-90 drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]",
              compact ? "text-7xl" : "text-[18rem]",
            )}
            style={{ filter: "saturate(110%)" }}
          >
            {background.emoji}
          </div>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent",
          compact ? "p-3 space-y-1.5" : "p-5 sm:p-6 space-y-3",
        )}
      >
        <Badge
          variant="glass"
          className={cn(
            "bg-white/20 text-white/90 border-0 backdrop-blur-sm",
            compact && "text-[10px] px-2 py-0.5",
          )}
        >
          Hosted by {hostName}
        </Badge>
        <h2
          className={cn(
            "font-semibold leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]",
            compact ? "text-lg" : "text-3xl sm:text-4xl",
          )}
          style={fontStyle(font)}
        >
          {title || "Your event"}
        </h2>
        {description && !compact && (
          <p className="text-sm opacity-90 line-clamp-2">{description}</p>
        )}
        <div
          className={cn(
            "flex flex-wrap items-center",
            compact ? "gap-x-2.5 gap-y-1 text-[11px]" : "gap-x-4 gap-y-1.5 text-sm",
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className={compact ? "h-3 w-3" : "h-4 w-4"} />
            {weekday}, {date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className={compact ? "h-3 w-3" : "h-4 w-4"} />
            {time}
          </span>
          {location?.name && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className={compact ? "h-3 w-3" : "h-4 w-4"} />
              {location.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
