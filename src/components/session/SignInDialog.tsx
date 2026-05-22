"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "./SessionProvider";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called once a user has been signed in (or already exists). */
  onComplete?: () => void;
  title?: string;
  subtitle?: string;
}

export function SignInDialog({ open, onClose, onComplete, title, subtitle }: Props) {
  const { user, signIn } = useSession();
  const [name, setName] = useState(user?.name && user.name !== "Guest" ? user.name : "");

  useEffect(() => {
    if (open) setName(user?.name && user.name !== "Guest" ? user.name : "");
  }, [open, user]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) return;
    signIn(name);
    onComplete?.();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.form
            onSubmit={submit}
            className="relative z-10 w-full max-w-sm glass rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-pop)]"
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div className="text-center space-y-2">
              <div
                className="mx-auto h-12 w-12 rounded-2xl text-white grid place-items-center text-2xl"
                style={{ background: "linear-gradient(155deg, #0a84ff, #5e5ce6)" }}
              >
                ✦
              </div>
              <h2 className="text-xl font-semibold tracking-tight">
                {title ?? "Pick a name"}
              </h2>
              <p className="text-sm text-[var(--foreground-secondary)]">
                {subtitle ?? "We'll use this so other guests can see who you are. You can change it anytime."}
              </p>
            </div>
            <label className="block mt-5">
              <span className="text-xs uppercase tracking-wider text-[var(--foreground-secondary)]">
                Your name
              </span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Olivia Bennett"
                className="mt-2 w-full px-4 py-3 rounded-[var(--radius-md)] bg-[var(--surface)] hairline focus-ring text-base"
              />
            </label>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full font-medium hairline tap-spring"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 py-3 rounded-full font-semibold text-white tap-spring disabled:opacity-40"
                style={{ background: "var(--accent)" }}
              >
                Continue
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
