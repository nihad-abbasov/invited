"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { InvitationCard } from "@/components/invitation/InvitationCard";
import type { InvitedEvent } from "@/lib/types";
import { formatShortDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

interface Props {
  event: InvitedEvent;
  currentUserId?: string;
}

export function EventTile({ event, currentUserId }: Props) {
  const isHost = event.hostId === currentUserId;
  const going = event.guests.filter((g) => g.status === "going").length;
  const me = currentUserId ? event.guests.find((g) => g.user.id === currentUserId) : undefined;

  const statusLabel = isHost ? "Hosting" : me?.status === "going" ? "Going" : me?.status ?? "Invited";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link href={`/events/${event.id}`} className="block">
        <div className="relative">
          <InvitationCard
            title={event.title}
            hostName={event.hostName}
            startAt={event.startAt}
            background={event.background}
            font={event.font}
            location={event.location}
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge variant="glass">{statusLabel}</Badge>
          </div>
        </div>
        <div className="mt-2 px-1 flex items-center justify-between text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatShortDate(event.startAt)}
          </span>
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {going}
            </span>
            {event.location?.name && (
              <span className="inline-flex items-center gap-1 max-w-[160px] truncate">
                <MapPin className="h-3.5 w-3.5" />
                {event.location.name}
              </span>
            )}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
