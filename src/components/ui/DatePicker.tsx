"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Calendar } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { cn } from "@/lib/cn";

interface DatePickerProps {
  /** Date as a "YYYY-MM-DD" string (matches <input type="date">). */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const pad = (n: number) => n.toString().padStart(2, "0");

/** Parse "YYYY-MM-DD" into a local Date (no timezone shift). */
function parse(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function toValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = parse(value);

  const label = selected
    ? selected.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-md bg-surface px-4 py-3 text-left text-base hairline focus-ring transition-colors hover:bg-fill-subtle",
          !selected && "text-subtle",
          className,
        )}
      >
        <CalendarDays className="h-4 w-4 opacity-60" />
        <span className="flex-1">{label}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (date) {
              onChange(toValue(date));
              setOpen(false);
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
