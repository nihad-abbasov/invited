/**
 * Mock Weather API.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 *  REPLACE-WITH-REAL-BACKEND NOTE
 * ──────────────────────────────────────────────────────────────────────────────
 *  Swap with WeatherKit, OpenWeather, Tomorrow.io, etc.
 *  Real call would look like:
 *
 *    GET /api/weather?lat=…&lng=…&date=ISO
 *      -> { condition, icon, high, low }
 *
 *  Keep the `WeatherForecast` shape stable.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import type { WeatherForecast } from "../types";

const CONDITIONS: WeatherForecast[] = [
  { condition: "Sunny", icon: "sun", high: 27, low: 18 },
  { condition: "Partly Cloudy", icon: "cloud-sun", high: 23, low: 15 },
  { condition: "Cloudy", icon: "cloud", high: 19, low: 12 },
  { condition: "Light Rain", icon: "cloud-rain", high: 16, low: 11 },
  { condition: "Clear Night", icon: "moon", high: 21, low: 14 },
  { condition: "Breezy", icon: "wind", high: 22, low: 14 },
];

/** Deterministic hash so the same event always gets the same forecast (feels real). */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export async function forecastFor(opts: {
  startAt: string;
  locationName?: string;
}): Promise<WeatherForecast> {
  const key = opts.startAt + "|" + (opts.locationName ?? "");
  const f = CONDITIONS[hash(key) % CONDITIONS.length];
  // Vary the temperature slightly so it's not always the same numbers.
  const jitter = (hash(key + "j") % 5) - 2;
  return new Promise((res) =>
    setTimeout(
      () => res({ ...f, high: f.high + jitter, low: f.low + jitter }),
      180,
    ),
  );
}
