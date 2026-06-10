"use client";

import { useState } from "react";
import { Copy, MessageCircle, Mail, Check, Share2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { buildInviteUrl } from "@/lib/inviteShare";
import type { InvitedEvent } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";

interface Props {
  open: boolean;
  onClose: () => void;
  event: InvitedEvent;
}

export function ShareDialog({ open, onClose, event }: Props) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const { toast } = useToast();
  const title = event.title;
  // Self-contained link: points at the deployed site and carries the event
  // details in the hash so it opens on any device without a backend.
  const url = buildInviteUrl(event);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast({ title: "Link copied", description: "Paste it anywhere to invite guests.", variant: "success" });
    } catch {
      toast({ title: "Couldn't copy link", description: "Copy it manually instead.", variant: "error" });
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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share invitation</DialogTitle>
          <DialogDescription>Anyone with the link can RSVP — no account required.</DialogDescription>
        </DialogHeader>

        <Card className="mt-5 p-3 flex items-center gap-2 shadow-none">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-subtle">Link</div>
            <div className="font-mono text-sm truncate">{url}</div>
          </div>
          <Button size="sm" onClick={copy} className="shrink-0">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </Card>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <ShareTile icon={<Share2 className="h-4 w-4" />} label="Share…" onClick={nativeShare} />
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
          type="button"
          onClick={() => setShowQr((v) => !v)}
          aria-expanded={showQr}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors py-1"
        >
          <QrCode className="h-4 w-4" />
          {showQr ? "Hide QR code" : "Show QR code"}
        </button>

        <AnimatePresence initial={false}>
          {showQr && url && (
            <motion.div
              key="qr"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mt-2 flex flex-col items-center gap-2 pb-1">
                {/* Always dark-on-white so it scans regardless of app theme. */}
                <div className="rounded-2xl bg-white p-4 shadow-(--shadow-pop)">
                  <QRCodeSVG value={url} size={200} level="M" marginSize={0} fgColor="#0b0b0c" bgColor="#ffffff" />
                </div>
                <div className="text-xs text-muted">Scan with a phone camera to open the invite.</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button variant="secondary" className="mt-5 w-full" onClick={onClose}>
          Done
        </Button>
      </DialogContent>
    </Dialog>
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
    <Card className="flex flex-col items-center gap-1.5 px-3 py-3 shadow-none tap-spring">
      <div className="h-9 w-9 rounded-full bg-accent text-white grid place-items-center">{icon}</div>
      <div className="text-xs font-medium">{label}</div>
    </Card>
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
