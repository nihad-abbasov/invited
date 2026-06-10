/** Display-identity helpers shared by client and server. */

const PALETTE = [
  "#0a84ff",
  "#ff2d55",
  "#34c759",
  "#af52de",
  "#ff9500",
  "#5e5ce6",
  "#ff375f",
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Deterministic monogram chip color from a display name. */
export function colorForName(name: string): string {
  return PALETTE[hash(name) % PALETTE.length];
}

/** Deterministic color from a stable id (used before a name is chosen). */
export function colorForId(id: string): string {
  return PALETTE[hash(id) % PALETTE.length];
}

/** 1-2 char monogram from a display name. */
export function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
