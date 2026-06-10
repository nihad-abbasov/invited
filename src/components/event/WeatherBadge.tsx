"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, CloudSun, Moon, Sun, Wind } from "lucide-react";
import { forecastFor } from "@/lib/api/weather";
import type { WeatherForecast } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

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
    return <Skeleton className="h-16" />;
  }

  const Icon = ICONS[f.icon];

  return (
    <Card className="px-4 py-3 flex items-center gap-3 shadow-none">
      <div
        className="h-10 w-10 rounded-xl grid place-items-center text-white"
        style={{ background: "linear-gradient(155deg, #5ec8ff, #0a84ff)" }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{f.condition}</div>
        <div className="text-xs text-muted">
          High {f.high}° · Low {f.low}°
        </div>
      </div>
      <Badge variant="default">Forecast</Badge>
    </Card>
  );
}
