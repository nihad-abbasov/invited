"use client";

import { useState } from "react";
import { Music2, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addTrack, removeTrack } from "@/lib/api/events";
import { formatDuration } from "@/lib/format";
import type { PlaylistTrack, User } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface Props {
  eventId: string;
  tracks: PlaylistTrack[];
  user: User | null;
  onChange: () => void;
}

const EMOJI_FALLBACKS = ["🎶", "🎧", "🎷", "🎸", "🪩", "🥁", "🎼", "🎺"];

export function PlaylistPanel({ eventId, tracks, user, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !artist.trim() || !user) return;
    await addTrack(eventId, {
      title: title.trim(),
      artist: artist.trim(),
      addedBy: user.name,
      durationMs: 180_000 + Math.floor(Math.random() * 120_000),
      artwork: EMOJI_FALLBACKS[Math.floor(Math.random() * EMOJI_FALLBACKS.length)],
    });
    setTitle("");
    setArtist("");
    setAdding(false);
    onChange();
  }

  async function remove(id: string) {
    await removeTrack(eventId, id);
    onChange();
  }

  const totalMs = tracks.reduce((acc, t) => acc + t.durationMs, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-muted">
          {tracks.length} {tracks.length === 1 ? "track" : "tracks"} · {formatDuration(totalMs)}
        </div>
        {!adding && (
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)} disabled={!user}>
            <Plus className="h-3.5 w-3.5" /> Add a track
          </Button>
        )}
      </div>

      <AnimatePresence>
        {adding && (
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-3"
          >
            <Card className="p-3 space-y-2 shadow-none">
              <Input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song title"
                className="py-2 text-sm border-0 bg-transparent px-0 focus-ring:outline-none"
              />
              <div className="h-px bg-hairline" />
              <Input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist"
                className="py-2 text-sm border-0 bg-transparent px-0"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="secondary" size="sm" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={!title.trim() || !artist.trim()}>
                  Add
                </Button>
              </div>
            </Card>
          </motion.form>
        )}
      </AnimatePresence>

      <Card className="overflow-hidden shadow-none">
        <ul className="divide-y divide-hairline">
          {tracks.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted">
              <Music2 className="h-6 w-6 mx-auto mb-2 opacity-60" />
              Nothing in the queue yet. Add the first song.
            </li>
          )}
          {tracks.map((t) => (
            <motion.li key={t.id} layout className="px-3 py-2.5 flex items-center gap-3 group">
              <div
                className="h-10 w-10 rounded-lg grid place-items-center text-xl"
                style={{ background: "linear-gradient(155deg, #af52de, #ff2d55)", color: "white" }}
              >
                {t.artwork || "🎶"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="text-xs text-muted truncate">
                  {t.artist} · added by {t.addedBy}
                </div>
              </div>
              <div className="text-xs tabular-nums text-subtle">
                {formatDuration(t.durationMs)}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(t.id)}
                className="opacity-0 group-hover:opacity-100 h-7 w-7"
                aria-label="Remove"
              >
                <X className="h-4 w-4 text-muted" />
              </Button>
            </motion.li>
          ))}
        </ul>
      </Card>
      <p className="mt-2 text-[11px] text-subtle">
        Apple Music sync is coming. For now this lives just in your event.
      </p>
    </div>
  );
}
