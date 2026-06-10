/** Short, friendly share code: 6 chars, no ambiguous glyphs. */
export function shortCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function uid(prefix = ""): string {
  return prefix + crypto.randomUUID();
}
