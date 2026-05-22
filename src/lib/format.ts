/**
 * Small formatting helpers used across the UI.
 */

/**
 * We pin a fixed locale on date formatting so SSR and CSR render the same
 * string (otherwise the server's locale may differ from the user's and React
 * complains about hydration mismatches).
 */
const LOCALE = "en-US";

export function formatEventDate(iso: string): { weekday: string; date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { weekday: "—", date: "Pick a date", time: "" };
  }
  const weekday = d.toLocaleDateString(LOCALE, { weekday: "long" });
  const date = d.toLocaleDateString(LOCALE, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString(LOCALE, { hour: "numeric", minute: "2-digit" });
  return { weekday, date, time };
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(LOCALE, { month: "short", day: "numeric" });
}

export function formatRelative(iso: string): string {
  const ms = +new Date(iso) - Date.now();
  const abs = Math.abs(ms);
  const min = 60_000, hr = 60 * min, day = 24 * hr;
  const future = ms > 0;
  const fmt = (n: number, u: string) => `${future ? "in " : ""}${n} ${u}${n === 1 ? "" : "s"}${future ? "" : " ago"}`;
  if (abs < min) return future ? "in a moment" : "just now";
  if (abs < hr) return fmt(Math.round(abs / min), "min");
  if (abs < day) return fmt(Math.round(abs / hr), "hour");
  if (abs < 7 * day) return fmt(Math.round(abs / day), "day");
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Build a normalized ISO string from <input type="date"> + <input type="time">. */
export function combineDateAndTime(date: string, time: string): string {
  if (!date) return ""; // Caller is expected to gate UI on an empty value.
  const t = time || "19:00";
  // Construct using local time, then convert to ISO (UTC).
  const d = new Date(`${date}T${t}:00`);
  return d.toISOString();
}

export function splitIsoForInputs(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}
