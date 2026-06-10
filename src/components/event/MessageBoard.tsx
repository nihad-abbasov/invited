"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { postMessage } from "@/lib/api/events";
import { formatRelative } from "@/lib/format";
import type { EventMessage, User } from "@/lib/types";
import { Avatar } from "@/components/session/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

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
        <form onSubmit={submit} className="flex items-center gap-1">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Post an update for your guests…"
            className="flex-1 py-2 text-sm"
          />
          <Button type="submit" size="icon" disabled={busy || !text.trim()} aria-label="Post">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}

      <ul className="mt-3 space-y-2">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <li>
              <Card className="px-4 py-6 text-center text-sm text-muted shadow-none">
                {isHost
                  ? "Drop a quick note here — parking tips, dress code, anything."
                  : "No updates from the host yet."}
              </Card>
            </li>
          )}
          {messages.map((m) => (
            <motion.li
              key={m.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <Card className="p-3 flex gap-3 shadow-none">
                <Avatar user={{ name: m.authorName, color: "var(--accent)" }} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-sm font-semibold truncate">{m.authorName}</div>
                    <div className="text-xs text-subtle shrink-0">
                      {formatRelative(m.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm mt-0.5 whitespace-pre-wrap break-words">{m.body}</div>
                </div>
              </Card>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
