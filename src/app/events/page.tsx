"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, CalendarDays, Search } from "lucide-react";
import { useSession } from "@/components/session/SessionProvider";
import { listEvents } from "@/lib/api/events";
import type { InvitedEvent } from "@/lib/types";
import { EventTile } from "@/components/events/EventTile";
import { Segmented } from "@/components/ui/Segmented";

type Bucket = "all" | "hosting" | "going" | "past";

export default function MyEventsPage() {
  const { user, ready } = useSession();
  const [events, setEvents] = useState<InvitedEvent[] | null>(null);
  const [bucket, setBucket] = useState<Bucket>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!ready) return;
    listEvents().then(setEvents);
  }, [ready, user?.id]);

  const filtered = useMemo(() => {
    if (!events) return [];
    const now = Date.now();
    return events.filter((e) => {
      const past = +new Date(e.startAt) < now;
      const matches = !q || e.title.toLowerCase().includes(q.toLowerCase());
      if (!matches) return false;
      if (bucket === "hosting") return e.hostId === user?.id && !past;
      if (bucket === "going")
        return e.hostId !== user?.id && e.guests.some((g) => g.user.id === user?.id && g.status === "going") && !past;
      if (bucket === "past") return past;
      return !past;
    });
  }, [events, bucket, q, user?.id]);

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">
            My events
          </h1>
          <p className="mt-1 text-[var(--foreground-secondary)]">
            Everything you&apos;re hosting, attending, or have been invited to.
          </p>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white font-semibold tap-spring"
          style={{ background: "var(--accent)" }}
        >
          <Plus className="h-4 w-4" />
          New event
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Segmented<Bucket>
          value={bucket}
          onChange={setBucket}
          options={[
            { value: "all", label: "Upcoming" },
            { value: "hosting", label: "Hosting" },
            { value: "going", label: "Going" },
            { value: "past", label: "Past" },
          ]}
        />
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-secondary)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events"
            className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[var(--surface)] hairline focus-ring text-sm"
          />
        </div>
      </div>

      <div className="mt-8">
        {!events ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-[var(--radius-xl)] shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((e) => (
              <EventTile key={e.id} event={e} currentUserId={user?.id} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 max-w-md mx-auto">
      <div
        className="mx-auto h-16 w-16 rounded-3xl grid place-items-center text-white"
        style={{ background: "linear-gradient(155deg, #0a84ff, #5e5ce6)" }}
      >
        <CalendarDays className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight">Nothing here yet</h2>
      <p className="mt-2 text-[var(--foreground-secondary)]">
        Create your first invitation and the moment kind of organizes itself.
      </p>
      <Link
        href="/create"
        className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white font-semibold tap-spring"
        style={{ background: "var(--accent)" }}
      >
        <Plus className="h-4 w-4" />
        Create an invitation
      </Link>
    </div>
  );
}
