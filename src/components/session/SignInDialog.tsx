"use client";

import { useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useSession } from "./SessionProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
}

export function SignInDialog({ open, onClose, onComplete, title, subtitle }: Props) {
  const { user, authMode, signIn, signInWithEmail, saveName } = useSession();

  // In auth mode, signed-out users pick an email; signed-in users (first time
  // or renaming) pick a display name. In local mode it's always a name.
  const nameStep = !authMode || !!user;

  const seed = nameStep && user?.name && user.name !== "Guest" ? user.name : "";
  const [name, setName] = useState(seed);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setName(seed);
      setEmail("");
      setSent(false);
      setError(null);
      setBusy(false);
    }
  }

  async function submitName(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      if (authMode) await saveName(name);
      else signIn(name);
      onComplete?.();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  async function submitEmail(e?: React.FormEvent) {
    e?.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    const res = await signInWithEmail(email);
    setBusy(false);
    if (res.ok) setSent(true);
    else setError("Couldn't send the link. Check the address and try again.");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        {sent ? (
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-(--green) text-white grid place-items-center">
              <MailCheck className="h-6 w-6" />
            </div>
            <DialogHeader>
              <DialogTitle>Check your email</DialogTitle>
              <DialogDescription>
                We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>.
                Open it on this device to continue.
              </DialogDescription>
            </DialogHeader>
            <Button className="mt-5 w-full" variant="secondary" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : nameStep ? (
          <form onSubmit={submitName}>
            <DialogHeader>
              <div
                className="mx-auto h-12 w-12 rounded-2xl text-white grid place-items-center text-2xl"
                style={{ background: "linear-gradient(155deg, #0a84ff, #5e5ce6)" }}
              >
                ✦
              </div>
              <DialogTitle>{title ?? "Pick a name"}</DialogTitle>
              <DialogDescription>
                {subtitle ?? "We'll use this so other guests can see who you are. You can change it anytime."}
              </DialogDescription>
            </DialogHeader>
            <label className="block mt-5">
              <Label className="text-xs tracking-wider">Your name</Label>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Olivia Bennett"
                className="mt-2"
              />
            </label>
            <DialogFooter>
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={!name.trim() || busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={submitEmail}>
            <DialogHeader>
              <div
                className="mx-auto h-12 w-12 rounded-2xl text-white grid place-items-center text-2xl"
                style={{ background: "linear-gradient(155deg, #0a84ff, #5e5ce6)" }}
              >
                ✦
              </div>
              <DialogTitle>{title ?? "Sign in"}</DialogTitle>
              <DialogDescription>
                {subtitle ?? "Enter your email and we'll send you a magic link — no password needed."}
              </DialogDescription>
            </DialogHeader>
            <label className="block mt-5">
              <Label className="text-xs tracking-wider">Email</Label>
              <Input
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2"
              />
            </label>
            {error && <p className="mt-2 text-sm text-(--red)">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={!email.trim() || busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send link"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
