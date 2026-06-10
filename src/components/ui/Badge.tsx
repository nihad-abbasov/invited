"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--fill-subtle)] text-foreground",
        accent: "bg-accent text-white",
        surface: "bg-surface hairline text-foreground",
        glass: "bg-white/85 text-black backdrop-blur",
        success: "bg-[var(--green)] text-white",
        warning: "bg-[var(--orange)] text-white",
        danger: "bg-[var(--red)] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
