"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postMessage } from "@/lib/api/events";
import { formatRelative } from "@/lib/format";
import type { EventMessage, User } from "@/lib/types";
import { Avatar } from "@/components/session/Avatar";

interface Props {
  eventId: string;
  messages: EventMessage[];
  user: User | null;
  isHost: boolean;
  onChange: () => void;
}

export function MessageBoard({ eventId, messages, user, isHost, onChange }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setBusy(true);
    await postMessage(eventId, text, user);
    setText("");
    setBusy(false);
    onChange();
  }

  return (
    <div>
      {isHost && user && (
        <form
          onSubmit={submit}
          className="rounded-[var(--radius-md)] bg-[var(--surface)] hairline p-1 flex items-center gap-1"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Post an update for your guests…"
            className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="h-9 w-9 rounded-full grid place-items-center text-white disabled:opacity-40 tap-spring"
            style={{ background: "var(--accent)" }}
            aria-label="Post"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}

      <ul className="mt-3 space-y-2">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <li className="text-sm text-[var(--foreground-secondary)] px-4 py-6 text-center bg-[var(--surface)] rounded-[var(--radius-md)] hairline">
              {isHost
                ? "Drop a quick note here — parking tips, dress code, anything."
                : "No updates from the host yet."}
            </li>
          )}
          {messages.map((m) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="rounded-[var(--radius-md)] bg-[var(--surface)] hairline p-3 flex gap-3"
            >
              <Avatar
                user={{ name: m.authorName, color: "var(--accent)" }}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-semibold truncate">{m.authorName}</div>
                  <div className="text-xs text-[var(--foreground-tertiary)] shrink-0">
                    {formatRelative(m.createdAt)}
                  </div>
                </div>
                <div className="text-sm mt-0.5 whitespace-pre-wrap break-words">{m.body}</div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
