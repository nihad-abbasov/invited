"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { User } from "@/lib/types";
import { useHydrated } from "@/lib/useHydrated";
import {
  currentUser as readCurrentUser,
  ensureUser,
  signIn as apiSignIn,
  signOut as apiSignOut,
  updateProfile as apiUpdateProfile,
} from "@/lib/api/session";

interface SessionContextValue {
  user: User | null;
  ready: boolean;
  signIn: (name: string) => User;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "avatar" | "color">>) => User;
  /** Returns a user, creating an anonymous "Guest" if none exists. */
  requireUser: () => User;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate session from storage once, on the first post-hydration render.
  // Adjusting state during render (guarded) avoids a setState-in-effect.
  const hydrated = useHydrated();
  if (hydrated && !ready) {
    setReady(true);
    setUser(readCurrentUser());
  }

  const signIn = useCallback((name: string) => {
    const u = apiSignIn(name);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(() => {
    apiSignOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<Pick<User, "name" | "avatar" | "color">>) => {
      const u = apiUpdateProfile(patch);
      setUser(u);
      return u;
    },
    [],
  );

  const requireUser = useCallback(() => {
    const u = ensureUser();
    setUser(u);
    return u;
  }, []);

  return (
    <SessionContext.Provider value={{ user, ready, signIn, signOut, updateProfile, requireUser }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}
