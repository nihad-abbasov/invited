"use client";

import { Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { cn } from "@/lib/cn";

interface TimePickerProps {
  /** Time as a 24-hour "HH:MM" string (matches <input type="time">). */
  value: string;
  onChange: (value: string) => void;
  className?: string;
  minuteStep?: number;
}

const pad = (n: number) => n.toString().padStart(2, "0");

export function TimePicker({ value, onChange, className, minuteStep = 5 }: TimePickerProps) {
  const [h, m] = value && value.includes(":") ? value.split(":") : ["", ""];

  const hours = Array.from({ length: 24 }, (_, i) => pad(i));
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => pad(i * minuteStep));

  const setHour = (hh: string) => onChange(`${hh}:${m || "00"}`);
  const setMinute = (mm: string) => onChange(`${h || "00"}:${mm}`);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Clock className="h-4 w-4 opacity-60 shrink-0" />
      <Select value={h} onValueChange={setHour}>
        <SelectTrigger className="tabular-nums" aria-label="Hour">
          <SelectValue placeholder="--" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((hh) => (
            <SelectItem key={hh} value={hh} className="tabular-nums justify-center">
              {hh}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted font-medium">:</span>
      <Select value={m} onValueChange={setMinute}>
        <SelectTrigger className="tabular-nums" aria-label="Minute">
          <SelectValue placeholder="--" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((mm) => (
            <SelectItem key={mm} value={mm} className="tabular-nums justify-center">
              {mm}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
