"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastVariant = "default" | "success" | "error" | "info";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss after this many ms. Defaults to 3500. Pass 0 to keep open. */
  duration?: number;
}

interface ToastItem extends Required<Omit<ToastOptions, "description">> {
  id: string;
  description?: string;
}

interface ToastContextValue {
  toast: (opts: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  default: Info,
  success: Check,
  error: AlertTriangle,
  info: Info,
};

const ACCENT: Record<ToastVariant, string> = {
  default: "var(--accent)",
  success: "var(--green)",
  error: "var(--red)",
  info: "var(--accent)",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 3500 }: ToastOptions) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, title, description, variant, duration }]);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-100 flex flex-col items-center gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.variant];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                role="status"
                aria-live="polite"
                className={cn(
                  "pointer-events-auto w-full bg-surface hairline rounded-lg",
                  "shadow-(--shadow-pop) px-4 py-3 flex items-start gap-3",
                )}
              >
                <span
                  className="mt-0.5 h-5 w-5 shrink-0 rounded-full grid place-items-center text-white"
                  style={{ background: ACCENT[t.variant] }}
                >
                  <Icon className="h-3 w-3" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-snug">{t.title}</div>
                  {t.description && (
                    <div className="text-xs text-muted mt-0.5 leading-snug">{t.description}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(t.id)}
                  className="shrink-0 h-6 w-6 grid place-items-center rounded-full hover:bg-fill-subtle transition-colors text-muted"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
