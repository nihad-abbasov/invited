"use client";

import { SessionProvider as NextAuthProvider } from "next-auth/react";

export function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
