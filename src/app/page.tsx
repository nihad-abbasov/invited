"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useHydrated } from "@/lib/useHydrated";
import {
  ArrowRight,
  CalendarHeart,
  Image as ImageIcon,
  MapPin,
  Music2,
  Sparkles,
  Users,
} from "lucide-react";
import { InvitationCard } from "@/components/invitation/InvitationCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

/**
 * We compute event dates relative to "now". Doing it during SSR uses server
 * time, which differs from client time and triggers React hydration warnings.
 * Hoist the timestamp into client-side state so the first render is stable.
 */
function useNow(): number | null {
  // Gate on hydration so SSR and the first client render agree (both null),
  // then expose a timestamp captured once via the lazy initializer.
  const hydrated = useHydrated();
  const [now] = useState(() => Date.now());
  return hydrated ? now : null;
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <SampleInvitations />
      <FinalCTA />
      <Footer />
    </>
  );
}

function Hero() {
  const now = useNow();
  const heroStartAt = (now ?? 0) + 6 * 86_400_000;
  return (
    <section className="relative overflow-hidden isolate">
      {/* Aurora background */}
      <div
        className="aurora absolute inset-0"
        aria-hidden
        style={{ zIndex: 0 }}
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-28 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium text-muted"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Build invitations in seconds
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="font-display mt-5 text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.04]"
          >
            Make the moment{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, #0a84ff, #af52de 60%, #ff2d55)",
              }}
            >
              feel like an event.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 text-lg sm:text-xl text-muted max-w-xl"
          >
            Invited brings the joy back to gathering. Beautiful invitations,
            effortless RSVPs, a shared photo album and a collaborative playlist
            — all in one place. Works on any device.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button
              asChild
              className="shadow-[0_8px_24px_-8px_rgba(10,132,255,0.6)]"
            >
              <Link href="/create">
                Create an invitation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" className="glass">
              <Link href="/events">View my events</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-sm text-subtle"
          >
            No app required. No iCloud needed.
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative max-w-[420px] mx-auto w-full"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <InvitationCard
              title="Rooftop Birthday"
              hostName="Olivia Bennett"
              startAt={new Date(heroStartAt).toISOString()}
              background={{
                kind: "emoji",
                emoji: "🎂",
                gradient: ["#ff7a59", "#ff2d92"],
              }}
              font="display"
              location={{ name: "The Skyline Loft" }}
              description="Bring good vibes (and a sweater)."
            />
          </motion.div>

          {/* Floating chips */}
          <motion.div
            initial={{ opacity: 0, x: -16, y: 12 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="absolute -left-6 top-10"
          >
            <Card className="glass rounded-2xl px-3 py-2 flex items-center gap-2 text-sm shadow-(--shadow-card) border-0">
              <Badge
                variant="success"
                className="h-2 w-2 p-0 rounded-full animate-pulse"
              />
              12 going
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 16, y: -8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="absolute -right-4 bottom-32"
          >
            <Card className="glass rounded-2xl px-3 py-2 flex items-center gap-2 text-sm shadow-(--shadow-card) border-0">
              <Music2 className="h-4 w-4 text-accent" />
              Playlist added
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: ImageIcon,
    title: "Beautiful by default",
    body: "Curated emoji and gradient backgrounds, or pick a photo from your library. Choose a font that fits the vibe.",
  },
  {
    icon: Users,
    title: "RSVPs without the spreadsheet",
    body: "Share a link in any app — iMessage, WhatsApp, Slack. Guests reply in one tap, on any device.",
  },
  {
    icon: MapPin,
    title: "Maps and weather, automatic",
    body: "Address chips, an interactive map preview and a forecast for the day, baked in.",
  },
  {
    icon: Music2,
    title: "A playlist everyone helps build",
    body: "Drop in tracks before the day. The whole crowd shapes the vibe.",
  },
  {
    icon: CalendarHeart,
    title: "A shared album for the memories",
    body: "Every photo from every guest, in one place after the moment ends.",
  },
  {
    icon: Sparkles,
    title: "Works everywhere",
    body: "Phone, tablet, laptop — same invitation, same magic. No download required.",
  },
];

function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold">
          Everything an event needs. Nothing it doesn&apos;t.
        </h2>
        <p className="mt-3 text-muted text-lg">
          From the first save-the-date to the last shared photo, Invited keeps
          the whole moment in one place.
        </p>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="h-full"
          >
            <Card className="glass h-full p-5 border-0 shadow-(--shadow-card)">
              <div
                className="h-10 w-10 rounded-2xl grid place-items-center text-white"
                style={{
                  background: "linear-gradient(155deg, #0a84ff, #5e5ce6)",
                }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">
                {f.body}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SampleInvitations() {
  const now = useNow();
  const base = now ?? 0;
  const samples: {
    title: string;
    emoji: string;
    gradient: [string, string];
    host: string;
  }[] = [
    {
      title: "Backyard BBQ",
      emoji: "🌮",
      gradient: ["#ffae3d", "#ff6a3d"],
      host: "Marcus",
    },
    {
      title: "Movie Marathon",
      emoji: "🎬",
      gradient: ["#1c1c1e", "#3a3a3c"],
      host: "Ana",
    },
    {
      title: "Engagement Toast",
      emoji: "💍",
      gradient: ["#f5f5f7", "#aeb6c0"],
      host: "Priya & Jordan",
    },
    {
      title: "Pool Party",
      emoji: "🏖️",
      gradient: ["#7ec8ff", "#1e90ff"],
      host: "Sam",
    },
  ];
  return (
    <section className="w-full mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          A look at the canvas
        </h2>
        <Button asChild variant="ghost" size="sm" className="text-accent shrink-0">
          <Link href="/create">
            Try it
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {samples.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <InvitationCard
              compact
              title={s.title}
              hostName={s.host}
              startAt={new Date(base + (i + 2) * 5 * 86_400_000).toISOString()}
              background={{
                kind: "emoji",
                emoji: s.emoji,
                gradient: s.gradient,
              }}
              font="display"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
      <div
        className="relative overflow-hidden rounded-xl p-10 sm:p-14 text-white"
        style={{
          background:
            "linear-gradient(135deg, #0a84ff 0%, #af52de 60%, #ff2d55 100%)",
        }}
      >
        <div className="relative z-10 max-w-2xl">
          <h2 className="font-display text-3xl sm:text-5xl font-semibold">
            Your next gathering is one tap away.
          </h2>
          <p className="mt-4 text-white/85 text-lg">
            Pick a vibe, set a date, share a link. We&apos;ll handle the rest.
          </p>
          <Button
            asChild
            variant="secondary"
            className="mt-7 bg-white text-black hover:bg-white/90"
          >
            <Link href="/create">
              Start an invitation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        {/* Decorative emoji */}
        <div className="absolute -right-10 -bottom-10 text-[18rem] opacity-25 select-none pointer-events-none">
          🎉
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="h-6 w-6 rounded-lg grid place-items-center text-white text-xs font-bold"
            style={{ background: "linear-gradient(155deg, #0a84ff, #5e5ce6)" }}
          >
            ✦
          </span>
          <span className="text-sm font-semibold tracking-tight">Invited</span>
        </div>
        <p className="text-xs text-subtle">
          Designed for moments worth remembering.
        </p>
      </div>
    </footer>
  );
}
