"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/cn";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "space-y-3",
        month_caption: "flex h-9 items-center justify-center px-9",
        caption_label: "text-sm font-semibold",
        nav: "absolute inset-x-1 top-0 flex items-center justify-between",
        button_previous:
          "h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-fill-subtle transition-colors disabled:opacity-30",
        button_next:
          "h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-fill-subtle transition-colors disabled:opacity-30",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-[0.7rem] font-medium uppercase tracking-wide text-subtle",
        week: "flex w-full mt-1",
        day: "h-9 w-9 p-0 text-center text-sm",
        day_button:
          "h-9 w-9 inline-flex items-center justify-center rounded-full font-medium hover:bg-fill-subtle transition-colors aria-selected:opacity-100",
        selected:
          "[&>button]:bg-accent [&>button]:text-white [&>button:hover]:bg-[var(--accent-hover)]",
        today: "[&>button]:font-bold [&>button]:text-accent",
        outside: "[&>button]:text-subtle [&>button]:opacity-50",
        disabled: "[&>button]:opacity-30 [&>button]:pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" {...rest} />
          ) : (
            <ChevronRight className="h-4 w-4" {...rest} />
          ),
      }}
      {...props}
    />
  );
}
