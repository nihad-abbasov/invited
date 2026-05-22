"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, CloudSun, Moon, Sun, Wind } from "lucide-react";
import { forecastFor } from "@/lib/api/weather";
import type { WeatherForecast } from "@/lib/types";

const ICONS = {
  sun: Sun,
  cloud: Cloud,
  "cloud-rain": CloudRain,
  "cloud-snow": CloudSnow,
  "cloud-sun": CloudSun,
  wind: Wind,
  moon: Moon,
} as const;

interface Props {
  startAt: string;
  locationName?: string;
}

export function WeatherBadge({ startAt, locationName }: Props) {
  const [f, setF] = useState<WeatherForecast | null>(null);

  useEffect(() => {
    let cancelled = false;
    forecastFor({ startAt, locationName }).then((data) => {
      if (!cancelled) setF(data);
    });
    return () => {
      cancelled = true;
    };
  }, [startAt, locationName]);

  if (!f) {
    return <div className="h-16 rounded-[var(--radius-md)] shimmer" />;
  }

  const Icon = ICONS[f.icon];

  return (
    <div className="rounded-[var(--radius-md)] bg-[var(--surface)] hairline px-4 py-3 flex items-center gap-3">
      <div
        className="h-10 w-10 rounded-xl grid place-items-center text-white"
        style={{ background: "linear-gradient(155deg, #5ec8ff, #0a84ff)" }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{f.condition}</div>
        <div className="text-xs text-[var(--foreground-secondary)]">
          High {f.high}° · Low {f.low}°
        </div>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--foreground-tertiary)]">
        Forecast
      </div>
    </div>
  );
}
