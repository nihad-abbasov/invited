import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Load Inter font data for `next/og` `ImageResponse` from the bundled
 * `@fontsource/inter` package.
 *
 * Why bundle instead of letting satori fetch a default font: OG image
 * generation should be deterministic and network-free. Fetching a remote font
 * at build/request time is slow and fails in restricted networks (e.g. behind
 * a proxy with a self-signed certificate).
 */
export async function loadOgFonts() {
  const dir = join(process.cwd(), "node_modules", "@fontsource", "inter", "files");
  const [regular, bold] = await Promise.all([
    readFile(join(dir, "inter-latin-400-normal.woff")),
    readFile(join(dir, "inter-latin-700-normal.woff")),
  ]);
  return [
    { name: "Inter", data: regular, style: "normal" as const, weight: 400 as const },
    { name: "Inter", data: bold, style: "normal" as const, weight: 700 as const },
  ];
}
