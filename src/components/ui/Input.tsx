"use client";

import { cn } from "@/lib/cn";

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "w-full px-4 py-3 rounded-md bg-surface hairline focus-ring text-base",
        "placeholder:text-subtle disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
