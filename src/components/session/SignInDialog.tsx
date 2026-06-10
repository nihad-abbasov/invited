"use client";

import { useState } from "react";
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
  const { user, signIn } = useSession();
  const seed = user?.name && user.name !== "Guest" ? user.name : "";
  const [name, setName] = useState(seed);
  // Re-seed the field each time the dialog transitions to open, using the
  // "adjust state during render" pattern instead of a setState-in-effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setName(seed);
  }

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) return;
    signIn(name);
    onComplete?.();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <form onSubmit={submit}>
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
            <Button type="submit" className="flex-1" disabled={!name.trim()}>
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
