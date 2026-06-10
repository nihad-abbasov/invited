"use client";

import { cn } from "@/lib/cn";
import { useHydrated } from "@/lib/useHydrated";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  className?: string;
}

export function Segmented<T extends string>({ value, onChange, options, className }: SegmentedProps<T>) {
  const mounted = useHydrated();

  if (!mounted) {
    return (
      <div className={cn("segmented", className)}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            data-active={o.value === value}
            className="inline-flex items-center gap-1.5"
            onClick={() => onChange(o.value)}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onChange(v as T)}
      className={cn("segmented", className)}
    >
      {options.map((o) => (
        <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
          {o.icon}
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
