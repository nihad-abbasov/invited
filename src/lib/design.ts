import type { EventBackground, EventFontPreset } from "./types";

/** Curated emoji backgrounds with paired gradients — mirrors Apple Invites' vibe. */
export const EMOJI_BACKGROUNDS: { emoji: string; gradient: [string, string]; label: string }[] = [
  { emoji: "🎂", gradient: ["#ff8a8a", "#ff2d92"], label: "Birthday" },
  { emoji: "🥂", gradient: ["#ffd86b", "#ff8a3d"], label: "Toast" },
  { emoji: "🎉", gradient: ["#ff7ab8", "#7a5cff"], label: "Party" },
  { emoji: "🌹", gradient: ["#ff5c8a", "#ff2d55"], label: "Romance" },
  { emoji: "🏖️", gradient: ["#7ec8ff", "#1e90ff"], label: "Beach" },
  { emoji: "🍷", gradient: ["#9b5cff", "#5e2bff"], label: "Wine" },
  { emoji: "🌮", gradient: ["#ffae3d", "#ff6a3d"], label: "Tacos" },
  { emoji: "🎄", gradient: ["#34c759", "#0a84ff"], label: "Holiday" },
  { emoji: "🎃", gradient: ["#ff9500", "#ff3b30"], label: "Halloween" },
  { emoji: "💍", gradient: ["#f5f5f7", "#aeb6c0"], label: "Engagement" },
  { emoji: "🍕", gradient: ["#ffc759", "#ff6a3d"], label: "Pizza" },
  { emoji: "☕", gradient: ["#c6a07a", "#6a4a2a"], label: "Coffee" },
  { emoji: "🌊", gradient: ["#5ee7df", "#0a84ff"], label: "Wave" },
  { emoji: "🏕️", gradient: ["#3ea66f", "#1a3d2e"], label: "Camp" },
  { emoji: "🎶", gradient: ["#ff7ab8", "#0a84ff"], label: "Music" },
  { emoji: "🪩", gradient: ["#af52de", "#0a84ff"], label: "Disco" },
];

export const COLOR_BACKGROUNDS: { gradient: [string, string]; label: string }[] = [
  { gradient: ["#0a84ff", "#5e5ce6"], label: "Cobalt" },
  { gradient: ["#ff375f", "#ff9500"], label: "Sunset" },
  { gradient: ["#34c759", "#0a84ff"], label: "Lagoon" },
  { gradient: ["#af52de", "#ff2d55"], label: "Berry" },
  { gradient: ["#1c1c1e", "#3a3a3c"], label: "Graphite" },
  { gradient: ["#ffd86b", "#ff8a3d"], label: "Sunrise" },
];

export const ACCENT_OPTIONS: { color: string; label: string }[] = [
  { color: "#0a84ff", label: "Blue" },
  { color: "#34c759", label: "Green" },
  { color: "#af52de", label: "Purple" },
  { color: "#ff9500", label: "Orange" },
  { color: "#ff2d55", label: "Pink" },
  { color: "#ff375f", label: "Red" },
  { color: "#5e5ce6", label: "Indigo" },
];

export const FONT_PRESETS: {
  id: EventFontPreset;
  label: string;
  cssVar: string;
  preview: string;
  style?: React.CSSProperties;
}[] = [
  {
    id: "display",
    label: "Display",
    cssVar: "var(--font-display)",
    preview: "The Big Night",
    style: { fontVariationSettings: '"SOFT" 80, "WONK" 0, "opsz" 144', letterSpacing: "-0.018em" },
  },
  { id: "rounded", label: "Rounded", cssVar: "var(--font-rounded)", preview: "Hello, friends" },
  { id: "script", label: "Script", cssVar: "var(--font-script)", preview: "Save the date" },
  { id: "mono", label: "Mono", cssVar: "var(--font-mono)", preview: "// invited" },
];

/** Compose a background into CSS we can inline on cards/hero. */
export function backgroundToCSS(bg: EventBackground): React.CSSProperties {
  if (bg.kind === "photo") {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55)), url(${JSON.stringify(bg.src)})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {
    background: `linear-gradient(155deg, ${bg.gradient[0]} 0%, ${bg.gradient[1]} 100%)`,
  };
}

/**
 * Inline-style helper for a given font preset. We bake in Fraunces variable
 * axes so the display preset always renders with the warmer SOFT setting,
 * regardless of where it's applied.
 *
 * NB: the `as EventFontPreset` fallback handles any legacy event saved with
 * the old "serif" id from earlier versions — degrades to the new display.
 */
export function fontStyle(font: EventFontPreset): React.CSSProperties {
  switch (font) {
    case "display":
      return {
        fontFamily: "var(--font-display)",
        fontVariationSettings: '"SOFT" 80, "WONK" 0, "opsz" 144',
        letterSpacing: "-0.018em",
      };
    case "rounded":
      return { fontFamily: "var(--font-rounded)", letterSpacing: "-0.005em" };
    case "script":
      return { fontFamily: "var(--font-script)", letterSpacing: 0 };
    case "mono":
      return { fontFamily: "var(--font-mono)", letterSpacing: "-0.01em" };
    default:
      return { fontFamily: "var(--font-display)" };
  }
}
