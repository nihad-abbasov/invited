"use client";

import { useState } from "react";
import { Check, HelpCircle, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import type { RsvpStatus, User } from "@/lib/types";
import { setRsvp } from "@/lib/api/events";
import { cn } from "@/lib/cn";

interface Props {
  eventId: string;
  user: User;
  current: RsvpStatus | undefined;
  onChange: () => void;
}

const OPTIONS: { id: RsvpStatus; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: "going", label: "Going", icon: Check, color: "var(--green)" },
  { id: "maybe", label: "Maybe", icon: HelpCircle, color: "var(--orange)" },
  { id: "declined", label: "Can't make it", icon: X, color: "var(--red)" },
];

export function RsvpBar({ eventId, user, current, onChange }: Props) {
  const [busy, setBusy] = useState<RsvpStatus | null>(null);

  async function pick(s: RsvpStatus) {
    if (busy) return;
    setBusy(s);
    await setRsvp(eventId, user, s);
    setBusy(null);
    onChange();
  }

  return (
    <div className="rounded-[var(--radius-lg)] bg-[var(--surface)] hairline p-1.5 grid grid-cols-3 gap-1">
      {OPTIONS.map((o) => {
        const active = current === o.id;
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => pick(o.id)}
            className={cn(
              "relative inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[12px] text-sm font-medium tap-spring transition-colors",
              !active && "hover:bg-[var(--hairline)]",
            )}
            style={active ? { background: o.color, color: "white" } : { color: "var(--foreground)" }}
          >
            {active && (
              <motion.span
                layoutId="rsvp-active"
                className="absolute inset-0 rounded-[12px]"
                style={{ background: o.color }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {busy === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
