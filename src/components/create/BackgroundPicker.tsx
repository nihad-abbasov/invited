"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Smile, Palette, Trash2 } from "lucide-react";
import { COLOR_BACKGROUNDS, EMOJI_BACKGROUNDS } from "@/lib/design";
import { fileToDataUrl } from "@/lib/api/photos";
import type { EventBackground } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Segmented } from "@/components/ui/Segmented";

interface Props {
  value: EventBackground;
  onChange: (b: EventBackground) => void;
}

type Tab = "emoji" | "color" | "photo";

export function BackgroundPicker({ value, onChange }: Props) {
  const [tab, setTab] = useState<Tab>(value.kind);
  const fileRef = useRef<HTMLInputElement>(null);

  async function pickFile(file: File | undefined) {
    if (!file) return;
    const src = await fileToDataUrl(file);
    onChange({ kind: "photo", src });
  }

  return (
    <div>
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { value: "emoji", label: "Emoji", icon: <Smile className="h-3.5 w-3.5" /> },
          { value: "color", label: "Color", icon: <Palette className="h-3.5 w-3.5" /> },
          { value: "photo", label: "Photo", icon: <ImageIcon className="h-3.5 w-3.5" /> },
        ]}
      />

      <div className="mt-4">
        {tab === "emoji" && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {EMOJI_BACKGROUNDS.map((b) => {
              const active =
                value.kind === "emoji" && value.emoji === b.emoji && value.gradient[0] === b.gradient[0];
              return (
                <button
                  key={b.emoji + b.label}
                  type="button"
                  onClick={() => onChange({ kind: "emoji", emoji: b.emoji, gradient: b.gradient })}
                  className={cn(
                    "aspect-square rounded-2xl relative overflow-hidden tap-spring transition-shadow",
                    active && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]",
                  )}
                  style={{
                    background: `linear-gradient(155deg, ${b.gradient[0]}, ${b.gradient[1]})`,
                  }}
                  aria-label={b.label}
                >
                  <span className="absolute inset-0 grid place-items-center text-4xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                    {b.emoji}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {tab === "color" && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {COLOR_BACKGROUNDS.map((b) => {
              const active = value.kind === "color" && value.gradient[0] === b.gradient[0];
              return (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => onChange({ kind: "color", gradient: b.gradient })}
                  className={cn(
                    "aspect-square rounded-2xl tap-spring transition-shadow",
                    active && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]",
                  )}
                  style={{
                    background: `linear-gradient(155deg, ${b.gradient[0]}, ${b.gradient[1]})`,
                  }}
                  aria-label={b.label}
                />
              );
            })}
          </div>
        )}

        {tab === "photo" && (
          <div className="space-y-3">
            {value.kind === "photo" ? (
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value.src} alt="Selected" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => onChange({ kind: "emoji", emoji: "🎉", gradient: ["#ff7ab8", "#7a5cff"] })}
                  className="absolute top-2 right-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 text-white text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full aspect-[4/3] rounded-2xl hairline grid place-items-center text-[var(--foreground-secondary)] tap-spring hover:bg-[var(--surface)]"
              >
                <div className="text-center">
                  <ImageIcon className="h-7 w-7 mx-auto mb-2" />
                  <div className="font-medium text-[var(--foreground)]">Upload a photo</div>
                  <div className="text-xs">PNG, JPG up to ~5MB. Stays on this device.</div>
                </div>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? undefined)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-sm font-medium text-[var(--accent)]"
            >
              {value.kind === "photo" ? "Replace photo" : "Choose from this device"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
