"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useHydrated } from "@/lib/useHydrated";
import { motion } from "framer-motion";
import { Plus, CalendarDays, Search, ArrowDownUp, ChevronDown } from "lucide-react";
import { useSession } from "@/components/session/SessionProvider";
import { listEvents } from "@/lib/api/events";
import type { InvitedEvent } from "@/lib/types";
import { EventTile } from "@/components/events/EventTile";
import { Segmented } from "@/components/ui/Segmented";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

type Bucket = "all" | "hosting" | "going" | "past";
type Sort = "soonest" | "latest" | "created" | "name" | "guests";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "soonest", label: "Date — soonest" },
  { value: "latest", label: "Date — latest" },
  { value: "created", label: "Recently created" },
  { value: "name", label: "Name (A–Z)" },
  { value: "guests", label: "Most guests" },
];

function goingCount(e: InvitedEvent): number {
  return e.guests.reduce(
    (n, g) => (g.status === "going" ? n + 1 + g.plusOnes : n),
    0,
  );
}

const COMPARATORS: Record<Sort, (a: InvitedEvent, b: InvitedEvent) => number> = {
  soonest: (a, b) => +new Date(a.startAt) - +new Date(b.startAt),
  latest: (a, b) => +new Date(b.startAt) - +new Date(a.startAt),
  created: (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  name: (a, b) => a.title.localeCompare(b.title),
  guests: (a, b) => goingCount(b) - goingCount(a),
};

export default function MyEventsPage() {
  const { user, ready } = useSession();
  const [events, setEvents] = useState<InvitedEvent[] | null>(null);
  // Captured when events load (in a callback, not during render) so the
  // past/upcoming split is pure at render time.
  const [now, setNow] = useState(0);
  const [bucket, setBucket] = useState<Bucket>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("soonest");

  useEffect(() => {
    if (!ready) return;
    listEvents().then((evts) => {
      setNow(Date.now());
      setEvents(evts);
    });
  }, [ready, user?.id]);

  const filtered = useMemo(() => {
    if (!events) return [];
    const matched = events.filter((e) => {
      const past = +new Date(e.startAt) < now;
      const matches = !q || e.title.toLowerCase().includes(q.toLowerCase());
      if (!matches) return false;
      if (bucket === "hosting") return e.hostId === user?.id && !past;
      if (bucket === "going")
        return e.hostId !== user?.id && e.guests.some((g) => g.user.id === user?.id && g.status === "going") && !past;
      if (bucket === "past") return past;
      return !past;
    });
    return matched.sort(COMPARATORS[sort]);
  }, [events, now, bucket, q, sort, user?.id]);

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold">
            My events
          </h1>
          <p className="mt-1 text-muted">
            Everything you&apos;re hosting, attending, or have been invited to.
          </p>
        </div>
        <Button asChild>
          <Link href="/create">
            <Plus className="h-4 w-4" />
            New event
          </Link>
        </Button>
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
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search events"
            className="pl-9 py-2.5 rounded-full text-sm"
          />
        </div>
        <SortControl value={sort} onChange={setSort} />
      </div>

      <div className="mt-8">
        {!events ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
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

/**
 * Sort dropdown. Radix Select emits trigger attributes (e.g. `aria-controls`)
 * during SSR that don't match the client's first render, causing a hydration
 * warning. Since sorting is a purely client-side affordance, we render a static
 * look-alike trigger until mounted — same pattern as <Segmented />.
 */
function SortControl({ value, onChange }: { value: Sort; onChange: (s: Sort) => void }) {
  // SSR-safe gate so Radix Select's trigger attributes don't mismatch on hydrate.
  const mounted = useHydrated();

  const triggerClasses =
    "flex w-full sm:w-48 items-center justify-between gap-2 rounded-full bg-surface px-4 py-2.5 text-sm hairline";
  const label = SORT_OPTIONS.find((o) => o.value === value)?.label ?? "";

  if (!mounted) {
    return (
      <div className={triggerClasses} aria-hidden>
        <span className="inline-flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4 text-muted" />
          {label}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={(v) => onChange(v as Sort)}>
      <SelectTrigger className="w-full sm:w-48 py-2.5 rounded-full text-sm" aria-label="Sort events">
        <span className="inline-flex items-center gap-2">
          <ArrowDownUp className="h-4 w-4 text-muted" />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-sm">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
      <p className="mt-2 text-muted">
        Create your first invitation and the moment kind of organizes itself.
      </p>
      <Button asChild className="mt-5">
        <Link href="/create">
          <Plus className="h-4 w-4" />
          Create an invitation
        </Link>
      </Button>
    </div>
  );
}
