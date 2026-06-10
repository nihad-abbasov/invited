"use client";

import { ACCENT_OPTIONS } from "@/lib/design";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export function AccentPicker({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {ACCENT_OPTIONS.map((o) => {
        const active = o.color.toLowerCase() === value.toLowerCase();
        return (
          <Button
            key={o.color}
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(o.color)}
            className={cn(
              "h-8 w-8 rounded-full p-0",
              active && "ring-2 ring-offset-2 ring-offset-[var(--background)]",
            )}
            style={{
              background: o.color,
              boxShadow: active ? `0 0 0 2px ${o.color}` : undefined,
            }}
            aria-label={o.label}
            title={o.label}
          />
        );
      })}
    </div>
  );
}
