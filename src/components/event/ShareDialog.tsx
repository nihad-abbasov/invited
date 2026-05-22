"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, MessageCircle, Mail, Check, Share2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  shortCode: string;
}

export function ShareDialog({ open, onClose, title, shortCode }: Props) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setUrl(`${window.location.origin}/i/${shortCode}`);
  }, [shortCode]);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* no-op */
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: `You're invited: ${title}`, url });
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-md glass rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-pop)]"
            initial={{ y: 32, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          >
            <div className="text-center">
              <h2 className="text-xl font-semibold tracking-tight">Share invitation</h2>
              <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                Anyone with the link can RSVP — no account required.
              </p>
            </div>

            <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--surface)] hairline p-3 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-[var(--foreground-tertiary)]">
                  Link
                </div>
                <div className="font-mono text-sm truncate">{url}</div>
              </div>
              <button
                onClick={copy}
                className="px-3 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 tap-spring text-white"
                style={{ background: "var(--accent)" }}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <ShareTile
                icon={<Share2 className="h-4 w-4" />}
                label="Share…"
                onClick={nativeShare}
              />
              <ShareTile
                icon={<MessageCircle className="h-4 w-4" />}
                label="iMessage"
                href={`sms:&body=${encodeURIComponent(`You're invited: ${title} — ${url}`)}`}
              />
              <ShareTile
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                href={`mailto:?subject=${encodeURIComponent(`You're invited: ${title}`)}&body=${encodeURIComponent(`${title}\n\n${url}`)}`}
              />
            </div>

            <button
              onClick={onClose}
              className="mt-5 w-full py-3 rounded-full font-medium hairline tap-spring"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShareTile({
  icon,
  label,
  onClick,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const inner = (
    <div className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-[var(--radius-md)] bg-[var(--surface)] hairline tap-spring">
      <div className="h-9 w-9 rounded-full bg-[var(--accent)] text-white grid place-items-center">
        {icon}
      </div>
      <div className="text-xs font-medium">{label}</div>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block">
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {inner}
    </button>
  );
}
