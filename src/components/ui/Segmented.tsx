"use client";

import { cn } from "@/lib/cn";

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  className?: string;
}

export function Segmented<T extends string>({ value, onChange, options, className }: SegmentedProps<T>) {
  return (
    <div className={cn("segmented", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-active={o.value === value}
          onClick={() => onChange(o.value)}
          className="inline-flex items-center gap-1.5"
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}
