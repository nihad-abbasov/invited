"use client";

import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, hint, children, className }: FieldProps) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-[11px] uppercase tracking-[0.18em] text-[var(--foreground-secondary)] font-medium">
        {label}
      </span>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-[var(--foreground-tertiary)]">{hint}</p>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-4 py-3 rounded-[var(--radius-md)] bg-[var(--surface)] hairline focus-ring text-base",
        props.className,
      )}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full px-4 py-3 rounded-[var(--radius-md)] bg-[var(--surface)] hairline focus-ring text-base resize-none",
        props.className,
      )}
    />
  );
}
