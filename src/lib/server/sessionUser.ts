import { auth, isAuthConfigured } from "@/auth";
import type { User } from "@/lib/types";

/**
 * The authenticated user (mapped to our domain `User`), or null when nobody is
 * signed in. The session callback already fills name/color/avatar.
 */
export async function resolveSessionUser(): Promise<User | null> {
  if (!isAuthConfigured()) return null;
  const session = await auth();
  const u = session?.user;
  if (!u?.id) return null;
  return {
    id: u.id,
    name: u.name ?? "Guest",
    color: u.color,
    avatar: u.avatar,
  };
}

export { isAuthConfigured };
