"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, HelpCircle, X, Loader2, Minus, Plus } from "lucide-react";
import type { Guest, RsvpStatus, User } from "@/lib/types";
import { setRsvp } from "@/lib/api/events";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { useToast } from "@/components/ui/Toast";

interface Props {
  eventId: string;
  user: User;
  current: RsvpStatus | undefined;
  /** The viewer's existing guest entry, used to seed plus-ones and note. */
  currentGuest?: Guest;
  onChange: () => void;
}

const OPTIONS: {
  id: RsvpStatus;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { id: "going", label: "Going", icon: Check, color: "var(--green)" },
  { id: "maybe", label: "Maybe", icon: HelpCircle, color: "var(--orange)" },
  { id: "declined", label: "Can't make it", icon: X, color: "var(--red)" },
];

const STATUS_TOAST: Record<RsvpStatus, string> = {
  going: "You're going 🎉",
  maybe: "Marked as maybe",
  declined: "Marked as can't make it",
  pending: "RSVP updated",
};

export function RsvpBar({ eventId, user, current, currentGuest, onChange }: Props) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<RsvpStatus | null>(null);
  // Seeded once from the viewer's existing reply. RsvpBar only mounts after the
  // event (and this guest record) has loaded, so an initializer is sufficient —
  // no resync effect needed.
  const [plusOnes, setPlusOnes] = useState(currentGuest?.plusOnes ?? 0);
  const [note, setNote] = useState(currentGuest?.note ?? "");
  const [savingExtras, setSavingExtras] = useState(false);

  const attending = current === "going" || current === "maybe";

  async function pick(s: RsvpStatus) {
    if (busy) return;
    setBusy(s);
    await setRsvp(eventId, user, s, { plusOnes, note: note.trim() || undefined });
    setBusy(null);
    onChange();
    toast({ title: STATUS_TOAST[s], variant: s === "declined" ? "default" : "success" });
  }

  async function changePlusOnes(next: number) {
    const clamped = Math.max(0, Math.min(20, next));
    setPlusOnes(clamped);
    if (!current || current === "pending") return; // only persist once they've replied
    await setRsvp(eventId, user, current, { plusOnes: clamped });
    onChange();
  }

  async function saveNote() {
    if (!current || current === "pending") return;
    if ((currentGuest?.note ?? "") === note.trim()) return; // nothing changed
    setSavingExtras(true);
    await setRsvp(eventId, user, current, { note: note.trim() || undefined });
    setSavingExtras(false);
    onChange();
    toast({ title: "Note saved", variant: "success" });
  }

  return (
    <div className="space-y-2">
      <Card className="p-1.5 shadow-none">
        <ToggleGroup
          type="single"
          value={current}
          onValueChange={(v) => v && pick(v as RsvpStatus)}
          className="grid grid-cols-3 gap-1 w-full"
        >
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <ToggleGroupItem
                key={o.id}
                value={o.id}
                disabled={!!busy}
                className="relative px-3 py-2.5 rounded-[12px] text-sm font-medium w-full data-[state=on]:shadow-none data-[state=on]:text-white"
                style={current === o.id ? { background: o.color, color: "white" } : undefined}
              >
                <span className="inline-flex items-center gap-1.5">
                  {busy === o.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                  {o.label}
                </span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      </Card>

      <AnimatePresence initial={false}>
        {attending && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-3 shadow-none space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Bringing guests?</div>
                  <div className="text-xs text-muted">Add plus-ones to your RSVP.</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={plusOnes <= 0}
                    onClick={() => changePlusOnes(plusOnes - 1)}
                    aria-label="Remove a plus-one"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold tabular-nums">{plusOnes}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={plusOnes >= 20}
                    onClick={() => changePlusOnes(plusOnes + 1)}
                    aria-label="Add a plus-one"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onBlur={saveNote}
                  placeholder="Add a note for the host (optional)"
                  className="py-2 text-sm"
                  maxLength={140}
                />
                {savingExtras && <div className="text-xs text-muted mt-1">Saving…</div>}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
