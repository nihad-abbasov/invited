"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  MapPin,
  Share2,
  Users,
  Music2,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { InvitationCard } from "@/components/invitation/InvitationCard";
import { MapPreview } from "@/components/event/MapPreview";
import { WeatherBadge } from "@/components/event/WeatherBadge";
import { GuestList } from "@/components/event/GuestList";
import { MessageBoard } from "@/components/event/MessageBoard";
import { PlaylistPanel } from "@/components/event/PlaylistPanel";
import { AlbumPanel } from "@/components/event/AlbumPanel";
import { RsvpBar } from "@/components/event/RsvpBar";
import { ShareDialog } from "@/components/event/ShareDialog";
import { SignInDialog } from "@/components/session/SignInDialog";
import { useSession } from "@/components/session/SessionProvider";
import { getEvent } from "@/lib/api/events";
import { formatEventDate } from "@/lib/format";
import type { InvitedEvent } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Props {
  eventId: string;
  /** Hide host-only controls (used on the public /i/[code] page when not host). */
  hideHostControls?: boolean;
  /** Show a "just created" celebration on first load. */
  celebrate?: boolean;
}

type Tab = "details" | "guests" | "messages" | "music" | "album";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "details", label: "Details", icon: Sparkles },
  { id: "guests", label: "Guests", icon: Users },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "music", label: "Music", icon: Music2 },
  { id: "album", label: "Album", icon: ImageIcon },
];

export function EventView({ eventId, hideHostControls, celebrate }: Props) {
  const { user, ready } = useSession();
  const [evt, setEvt] = useState<InvitedEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("details");
  const [shareOpen, setShareOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  async function refresh() {
    const e = await getEvent(eventId);
    setEvt(e);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    if (celebrate && evt && !celebrated) {
      setShareOpen(true);
      setCelebrated(true);
    }
  }, [celebrate, evt, celebrated]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 space-y-4">
        <div className="h-72 rounded-[var(--radius-xl)] shimmer" />
        <div className="h-12 rounded-[var(--radius-md)] shimmer" />
        <div className="h-64 rounded-[var(--radius-md)] shimmer" />
      </div>
    );
  }

  if (!evt) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">This invitation isn&apos;t available.</h1>
        <p className="mt-2 text-[var(--foreground-secondary)]">
          The link may have expired or the event was deleted.
        </p>
      </div>
    );
  }

  const isHost = ready && user?.id === evt.hostId;
  const me = user ? evt.guests.find((g) => g.user.id === user.id) : undefined;
  const { weekday, date, time } = formatEventDate(evt.startAt);

  return (
    <>
      <SignInDialog
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onComplete={refresh}
        title="One quick thing"
        subtitle="Pick a name so the host knows who's coming."
      />
      <ShareDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title={evt.title}
        shortCode={evt.shortCode}
      />

      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 sm:py-10 grid lg:grid-cols-[minmax(0,1fr)_360px] gap-8">
        {/* Left column */}
        <div className="min-w-0">
          <div className="max-w-md mx-auto lg:mx-0">
            <InvitationCard
              title={evt.title}
              hostName={evt.hostName}
              startAt={evt.startAt}
              background={evt.background}
              font={evt.font}
              description={evt.description}
              location={evt.location}
            />
          </div>

          {/* Action row */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!hideHostControls && isHost && (
              <button
                onClick={() => setShareOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold text-white tap-spring"
                style={{ background: evt.accent }}
              >
                <Share2 className="h-4 w-4" />
                Share invitation
              </button>
            )}
            {!isHost && (
              <div className="text-sm text-[var(--foreground-secondary)]">
                Hosted by <span className="font-medium text-[var(--foreground)]">{evt.hostName}</span>
              </div>
            )}
          </div>

          {/* RSVP — only show to non-hosts. Hosts already show as going. */}
          {!isHost && (
            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--foreground-secondary)] font-medium mb-2">
                Your reply
              </div>
              {user ? (
                <RsvpBar
                  eventId={evt.id}
                  user={user}
                  current={me?.status}
                  onChange={refresh}
                />
              ) : (
                <button
                  onClick={() => setSignInOpen(true)}
                  className="w-full py-3 rounded-full font-semibold text-white tap-spring"
                  style={{ background: evt.accent }}
                >
                  RSVP
                </button>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="mt-8 sticky top-14 z-20 -mx-4 sm:mx-0 sm:rounded-full bg-[var(--background)]/80 backdrop-blur sm:backdrop-blur-md py-2 sm:py-0">
            <div className="px-4 sm:px-0 flex items-center gap-1 overflow-x-auto no-scrollbar">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                      active
                        ? "bg-[var(--surface)] hairline shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                        : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5"
          >
            {tab === "details" && (
              <div className="space-y-4">
                {evt.description && (
                  <p className="text-base text-[var(--foreground)] leading-relaxed">
                    {evt.description}
                  </p>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoCard
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Date"
                    value={`${weekday}, ${date}`}
                  />
                  <InfoCard icon={<Clock className="h-4 w-4" />} label="Time" value={time} />
                </div>
                {evt.location?.name && <MapPreview location={evt.location} />}
                <WeatherBadge startAt={evt.startAt} locationName={evt.location?.name} />
              </div>
            )}
            {tab === "guests" && <GuestList guests={evt.guests} />}
            {tab === "messages" && (
              <MessageBoard
                eventId={evt.id}
                messages={evt.messages}
                user={user}
                isHost={!!isHost}
                onChange={refresh}
              />
            )}
            {tab === "music" && (
              <PlaylistPanel
                eventId={evt.id}
                tracks={evt.playlist}
                user={user}
                onChange={refresh}
              />
            )}
            {tab === "album" && (
              <AlbumPanel
                eventId={evt.id}
                photos={evt.album}
                user={user}
                onChange={refresh}
              />
            )}
          </motion.div>
        </div>

        {/* Right sidebar — quick summary */}
        <aside className="hidden lg:block lg:sticky lg:top-24 self-start space-y-4">
          <div className="rounded-[var(--radius-lg)] bg-[var(--surface)] hairline overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--hairline)]">
              <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--foreground-secondary)] font-medium">
                At a glance
              </div>
            </div>
            <div className="divide-y divide-[var(--hairline)]">
              <SummaryRow icon={<CalendarDays className="h-4 w-4" />}>
                {weekday}, {date}
              </SummaryRow>
              <SummaryRow icon={<Clock className="h-4 w-4" />}>{time}</SummaryRow>
              {evt.location?.name && (
                <SummaryRow icon={<MapPin className="h-4 w-4" />}>
                  <div className="truncate">
                    <div className="font-medium truncate">{evt.location.name}</div>
                    {evt.location.address && (
                      <div className="text-xs text-[var(--foreground-secondary)] truncate">
                        {evt.location.address}
                      </div>
                    )}
                  </div>
                </SummaryRow>
              )}
              <SummaryRow icon={<Users className="h-4 w-4" />}>
                <span>
                  <span className="font-medium">{evt.guests.filter((g) => g.status === "going").length}</span>{" "}
                  going · {evt.guests.filter((g) => g.status === "maybe").length} maybe
                </span>
              </SummaryRow>
            </div>
          </div>

          {!hideHostControls && isHost && (
            <button
              onClick={() => setShareOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-white font-semibold tap-spring"
              style={{ background: evt.accent }}
            >
              <Share2 className="h-4 w-4" />
              Share invitation
            </button>
          )}
        </aside>
      </div>
    </>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface)] hairline px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-[var(--foreground-secondary)] flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}

function SummaryRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 flex items-start gap-3 text-sm">
      <span className="h-7 w-7 shrink-0 rounded-full bg-[var(--hairline)] grid place-items-center text-[var(--foreground-secondary)]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
