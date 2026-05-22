"use client";

import { cn } from "@/lib/cn";
import type { User } from "@/lib/types";

interface AvatarProps {
  user: Pick<User, "name" | "avatar" | "color">;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
}

const SIZE = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-2xl",
};

export function Avatar({ user, size = "md", className, ring }: AvatarProps) {
  const initials =
    user.avatar ||
    (user.name?.split(/\s+/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
        ring && "ring-2 ring-[var(--surface)]",
        SIZE[size],
        className,
      )}
      style={{ backgroundColor: user.color || "#0a84ff" }}
      title={user.name}
    >
      {initials}
    </span>
  );
}
