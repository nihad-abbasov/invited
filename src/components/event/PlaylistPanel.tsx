"use client";

import { useState } from "react";
import { Music2, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { addTrack, removeTrack } from "@/lib/api/events";
import { formatDuration } from "@/lib/format";
import type { PlaylistTrack, User } from "@/lib/types";

interface Props {
  eventId: string;
  tracks: PlaylistTrack[];
  user: User | null;
  onChange: () => void;
}

const EMOJI_FALLBACKS = ["🎶", "🎧", "🎷", "🎸", "🪩", "🥁", "🎼", "🎺"];

/**
 * Mocked playlist editor.
 *
 * REPLACE-WITH-APPLE-MUSIC NOTE:
 *  Apple Music's MusicKit JS supports building collaborative playlists, but
 *  it requires an Apple Music subscription on both ends. When you wire that in:
 *    - Use MusicKit's search to pick real tracks (artwork, ids, durations).
 *    - Save the persistent playlist id (and ISRC/track ids) on the event.
 *    - Restrict edit privileges to attendees marked "going".
 */
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
        <div className="text-sm text-[var(--foreground-secondary)]">
          {tracks.length} {tracks.length === 1 ? "track" : "tracks"} ·{" "}
          {formatDuration(totalMs)}
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            disabled={!user}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hairline tap-spring"
          >
            <Plus className="h-3.5 w-3.5" /> Add a track
          </button>
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
            <div className="rounded-[var(--radius-md)] bg-[var(--surface)] hairline p-3 space-y-2">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song title"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
              <div className="h-px bg-[var(--hairline)]" />
              <input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium hairline tap-spring"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !artist.trim()}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold text-white disabled:opacity-40 tap-spring"
                  style={{ background: "var(--accent)" }}
                >
                  Add
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <ul className="bg-[var(--surface)] rounded-[var(--radius-md)] hairline divide-y divide-[var(--hairline)]">
        {tracks.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-[var(--foreground-secondary)]">
            <Music2 className="h-6 w-6 mx-auto mb-2 opacity-60" />
            Nothing in the queue yet. Add the first song.
          </li>
        )}
        {tracks.map((t) => (
          <motion.li
            key={t.id}
            layout
            className="px-3 py-2.5 flex items-center gap-3 group"
          >
            <div
              className="h-10 w-10 rounded-lg grid place-items-center text-xl"
              style={{ background: "linear-gradient(155deg, #af52de, #ff2d55)", color: "white" }}
            >
              {t.artwork || "🎶"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{t.title}</div>
              <div className="text-xs text-[var(--foreground-secondary)] truncate">
                {t.artist} · added by {t.addedBy}
              </div>
            </div>
            <div className="text-xs tabular-nums text-[var(--foreground-tertiary)]">
              {formatDuration(t.durationMs)}
            </div>
            <button
              onClick={() => remove(t.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-full grid place-items-center hover:bg-[var(--hairline)]"
              aria-label="Remove"
            >
              <X className="h-4 w-4 text-[var(--foreground-secondary)]" />
            </button>
          </motion.li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-[var(--foreground-tertiary)]">
        Apple Music sync is coming. For now this lives just in your event.
      </p>
    </div>
  );
}
