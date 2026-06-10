"use client";

import { FONT_PRESETS } from "@/lib/design";
import type { EventFontPreset } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";

interface Props {
  value: EventFontPreset;
  onChange: (f: EventFontPreset) => void;
}

export function FontPicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FONT_PRESETS.map((f) => {
        const active = value === f.id;
        return (
          <button key={f.id} type="button" onClick={() => onChange(f.id)} className="text-left tap-spring">
            <Card
              className={cn(
                "px-4 py-3 shadow-none transition-colors",
                active ? "ring-2 ring-accent" : "hover:bg-fill-subtle",
              )}
            >
              <div
                className={cn("leading-tight", f.id === "script" ? "text-2xl" : "text-lg font-semibold")}
                style={{ fontFamily: f.cssVar, ...f.style }}
              >
                {f.preview}
              </div>
              <div className="text-xs text-muted mt-1">{f.label}</div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
