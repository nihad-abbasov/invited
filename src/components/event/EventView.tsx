"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Pencil,
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
import { getEvent, isOrganizer } from "@/lib/api/events";
import { formatEventDate } from "@/lib/format";
import type { InvitedEvent } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

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

  // Initial load. setState lives in the async callback (not the effect body),
  // so it doesn't count as a synchronous setState-in-effect.
  useEffect(() => {
    let active = true;
    getEvent(eventId).then((e) => {
      if (!active) return;
      setEvt(e);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [eventId]);

  // Open the share sheet once on first load when celebrating a new event.
  if (celebrate && evt && !celebrated) {
    setCelebrated(true);
    setShareOpen(true);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 space-y-4">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!evt) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">This invitation isn&apos;t available.</h1>
        <p className="mt-2 text-muted">
          The link may have expired or the event was deleted.
        </p>
      </div>
    );
  }

  const isHost = ready && user?.id === evt.hostId;
  const canManage = ready && isOrganizer(evt, user?.id);
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
            {!hideHostControls && canManage && (
              <>
                <Button size="sm" onClick={() => setShareOpen(true)} style={{ background: evt.accent }}>
                  <Share2 className="h-4 w-4" />
                  Share invitation
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/events/${evt.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              </>
            )}
            {!canManage && (
              <div className="text-sm text-muted">
                Hosted by <span className="font-medium text-foreground">{evt.hostName}</span>
                {evt.coHosts && evt.coHosts.length > 0 && (
                  <> &amp; {evt.coHosts.map((c) => c.name).join(", ")}</>
                )}
              </div>
            )}
          </div>

          {/* RSVP — only show to those who aren't organizing. Organizers already attend. */}
          {!canManage && (
            <div className="mt-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium mb-2">
                Your reply
              </div>
              {user ? (
                <RsvpBar
                  eventId={evt.id}
                  user={user}
                  current={me?.status}
                  currentGuest={me}
                  onChange={refresh}
                />
              ) : (
                <Button className="w-full" onClick={() => setSignInOpen(true)} style={{ background: evt.accent }}>
                  RSVP
                </Button>
              )}
            </div>
          )}

          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-8 sticky top-14 z-20">
            <TabsList className="w-full justify-start -mx-4 sm:mx-0 px-4 sm:px-0 bg-[var(--background)]/80 backdrop-blur">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <TabsTrigger key={t.id} value={t.id} className="text-sm px-3.5 py-2">
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="details">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                {evt.description && (
                  <p className="text-base text-foreground leading-relaxed">{evt.description}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoCard icon={<CalendarDays className="h-4 w-4" />} label="Date" value={`${weekday}, ${date}`} />
                  <InfoCard icon={<Clock className="h-4 w-4" />} label="Time" value={time} />
                </div>
                {evt.location?.name && <MapPreview location={evt.location} />}
                <WeatherBadge startAt={evt.startAt} locationName={evt.location?.name} />
              </motion.div>
            </TabsContent>
            <TabsContent value="guests">
              <GuestList guests={evt.guests} />
            </TabsContent>
            <TabsContent value="messages">
              <MessageBoard eventId={evt.id} messages={evt.messages} user={user} isHost={!!isHost} onChange={refresh} />
            </TabsContent>
            <TabsContent value="music">
              <PlaylistPanel eventId={evt.id} tracks={evt.playlist} user={user} onChange={refresh} />
            </TabsContent>
            <TabsContent value="album">
              <AlbumPanel eventId={evt.id} photos={evt.album} user={user} onChange={refresh} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar — quick summary */}
        <aside className="hidden lg:block lg:sticky lg:top-24 self-start space-y-4">
          <Card className="overflow-hidden shadow-none p-0">
            <CardHeader className="border-b border-hairline py-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted font-medium">
                At a glance
              </div>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-hairline">
              <SummaryRow icon={<CalendarDays className="h-4 w-4" />}>
                {weekday}, {date}
              </SummaryRow>
              <SummaryRow icon={<Clock className="h-4 w-4" />}>{time}</SummaryRow>
              {evt.location?.name && (
                <SummaryRow icon={<MapPin className="h-4 w-4" />}>
                  <div className="truncate">
                    <div className="font-medium truncate">{evt.location.name}</div>
                    {evt.location.address && (
                      <div className="text-xs text-muted truncate">
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
            </CardContent>
          </Card>

          {!hideHostControls && canManage && (
            <div className="space-y-2">
              <Button className="w-full" onClick={() => setShareOpen(true)} style={{ background: evt.accent }}>
                <Share2 className="h-4 w-4" />
                Share invitation
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/events/${evt.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                  Edit event
                </Link>
              </Button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="px-4 py-3 shadow-none">
      <div className="text-[10px] uppercase tracking-wider text-muted flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </Card>
  );
}

function SummaryRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 flex items-start gap-3 text-sm">
      <span className="h-7 w-7 shrink-0 rounded-full bg-hairline grid place-items-center text-muted">
        {icon}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
