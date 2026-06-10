"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, HelpCircle, X, Clock } from "lucide-react";
import { Avatar } from "@/components/session/Avatar";
import type { Guest, RsvpStatus } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";

const ICONS: Record<RsvpStatus, React.ComponentType<{ className?: string }>> = {
  going: Check,
  maybe: HelpCircle,
  declined: X,
  pending: Clock,
};

const COLOR: Record<RsvpStatus, string> = {
  going: "var(--green)",
  maybe: "var(--orange)",
  declined: "var(--red)",
  pending: "var(--foreground-tertiary)",
};

const LABEL: Record<RsvpStatus, string> = {
  going: "Going",
  maybe: "Maybe",
  declined: "Can't make it",
  pending: "Not replied",
};

interface Props {
  guests: Guest[];
}

const FILTERS: { id: "all" | RsvpStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "going", label: "Going" },
  { id: "maybe", label: "Maybe" },
  { id: "declined", label: "Declined" },
  { id: "pending", label: "Pending" },
];

export function GuestList({ guests }: Props) {
  const [filter, setFilter] = useState<"all" | RsvpStatus>("all");
  const counts = guests.reduce<Record<RsvpStatus, number>>(
    (acc, g) => {
      acc[g.status] += 1 + g.plusOnes;
      return acc;
    },
    { going: 0, maybe: 0, declined: 0, pending: 0 },
  );

  const filtered = filter === "all" ? guests : guests.filter((g) => g.status === filter);

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
        <StatChip label="Going" color="var(--green)" value={counts.going} />
        <StatChip label="Maybe" color="var(--orange)" value={counts.maybe} />
        <StatChip label="Declined" color="var(--red)" value={counts.declined} />
        <StatChip label="Pending" color="var(--foreground-tertiary)" value={counts.pending} className="hidden sm:block" />
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | RsvpStatus)}>
        <TabsList className="w-full justify-start -mx-1 px-1">
          {FILTERS.map((f) => (
            <TabsTrigger key={f.id} value={f.id}>
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="mt-2 overflow-hidden shadow-none">
        <ul className="divide-y divide-hairline">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted">
              No one here yet.
            </li>
          )}
          {filtered.map((g) => {
            const Icon = ICONS[g.status];
            return (
              <motion.li key={g.id} layout className="px-4 py-3 flex items-center gap-3">
                <Avatar user={g.user} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {g.user.name}
                    {g.plusOnes > 0 && (
                      <span className="ml-1 text-xs text-muted font-normal">
                        +{g.plusOnes}
                      </span>
                    )}
                  </div>
                  {g.note && (
                    <div className="text-xs text-muted truncate">{g.note}</div>
                  )}
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: COLOR[g.status] }}>
                  <Icon className="h-3.5 w-3.5" />
                  {LABEL[g.status]}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function StatChip({
  label,
  value,
  color,
  className,
}: {
  label: string;
  value: number;
  color: string;
  className?: string;
}) {
  return (
    <Card className={cn("px-3 py-2 shadow-none", className)}>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5 text-lg font-semibold" style={{ color }}>
        {value}
      </div>
    </Card>
  );
}
