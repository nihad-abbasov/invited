"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/cn";

export const ToggleGroup = ToggleGroupPrimitive.Root;

export function ToggleGroupItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors",
        "text-foreground hover:text-foreground",
        "data-[state=on]:bg-surface data-[state=on]:shadow-[0_1px_3px_rgba(0,0,0,0.1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}
