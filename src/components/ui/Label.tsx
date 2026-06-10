"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/cn";

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "block text-[11px] uppercase tracking-[0.18em] text-muted font-medium",
        className,
      )}
      {...props}
    />
  );
}
