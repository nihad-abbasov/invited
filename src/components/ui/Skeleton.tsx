"use client";

import { cn } from "@/lib/cn";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("shimmer rounded-md", className)} {...props} />;
}
