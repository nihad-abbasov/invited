"use client";

import { cn } from "@/lib/cn";
import type { User } from "@/lib/types";
import { Avatar as AvatarRoot, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";

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

function initialsFrom(user: Pick<User, "name" | "avatar">): string {
  if (user.avatar && user.avatar.length <= 3) return user.avatar;
  return (
    user.name
      ?.split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

/** True when `avatar` looks like a URL or data URI, not initials. */
function isImageSrc(avatar: string | undefined): avatar is string {
  if (!avatar) return false;
  return avatar.startsWith("http") || avatar.startsWith("data:") || avatar.startsWith("/");
}

export function Avatar({ user, size = "md", className, ring }: AvatarProps) {
  const initials = initialsFrom(user);
  const src = isImageSrc(user.avatar) ? user.avatar : undefined;

  return (
    <AvatarRoot
      className={cn(SIZE[size], ring && "ring-2 ring-surface", className)}
      title={user.name}
    >
      {src && <AvatarImage src={src} alt={user.name} />}
      <AvatarFallback style={{ backgroundColor: user.color || "#0a84ff" }}>{initials}</AvatarFallback>
    </AvatarRoot>
  );
}
