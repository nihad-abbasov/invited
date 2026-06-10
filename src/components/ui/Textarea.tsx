"use client";

import { cn } from "@/lib/cn";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "w-full px-4 py-3 rounded-md bg-surface hairline focus-ring text-base resize-none",
        "placeholder:text-subtle disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
