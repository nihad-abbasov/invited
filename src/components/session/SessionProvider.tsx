"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useSession as useNextAuthSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";
import {
  currentUser as readCurrentUser,
  ensureUser,
  signIn as apiSignIn,
  signOut as apiSignOut,
  updateProfile as apiUpdateProfile,
} from "@/lib/api/session";
import { isAuthEnabled } from "@/lib/api/status";
import { useHydrated } from "@/lib/useHydrated";
import type { User } from "@/lib/types";

interface SessionContextValue {
  user: User | null;
  ready: boolean;
  /** True when real (email magic-link) auth is active. */
  authMode: boolean;
  /** Signed in via auth but hasn't chosen a display name yet. */
  needsProfile: boolean;
  /** Local (no-auth) mode: set a display name on this device. */
  signIn: (name: string) => User;
  /** Auth mode: send a magic link to this email. */
  signInWithEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  /** Auth mode: persist the chosen display name to the account. */
  saveName: (name: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (
    patch: Partial<Pick<User, "name" | "avatar" | "color">>,
  ) => User;
  /** Returns a user, creating an anonymous "Guest" if none exists (local mode). */
  requireUser: () => User;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [authMode, setAuthMode] = useState<boolean | null>(null);
  useEffect(() => {
    isAuthEnabled().then(setAuthMode);
  }, []);

  if (authMode === true) return <AuthSession>{children}</AuthSession>;
  return <LocalSession waiting={authMode === null}>{children}</LocalSession>;
}

/** Email magic-link identity backed by Auth.js. */
function AuthSession({ children }: { children: React.ReactNode }) {
  const { data, status, update } = useNextAuthSession();
  const su = data?.user;
  const user: User | null = su?.id
    ? {
        id: su.id,
        name: su.name ?? "Guest",
        color: su.color,
        avatar: su.avatar,
      }
    : null;

  const signInWithEmail = useCallback(async (email: string) => {
    const res = await nextAuthSignIn("resend", {
      email: email.trim(),
      redirect: false,
      callbackUrl: typeof window !== "undefined" ? window.location.href : "/",
    });
    if (!res || res.error) return { ok: false, error: res?.error ?? "unknown" };
    return { ok: true };
  }, []);

  const saveName = useCallback(
    async (name: string) => {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      await update();
    },
    [update],
  );

  const signOut = useCallback(() => {
    nextAuthSignOut({ redirect: false });
  }, []);

  const notSupported = () => {
    throw new Error("Not available in auth mode");
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        ready: status !== "loading",
        authMode: true,
        needsProfile: !!su && !su.hasProfile,
        signIn: notSupported,
        signInWithEmail,
        saveName,
        signOut,
        updateProfile: notSupported,
        requireUser: notSupported,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

/** Per-device localStorage identity (no backend / local dev). */
function LocalSession({
  children,
  waiting,
}: {
  children: React.ReactNode;
  waiting: boolean;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const hydrated = useHydrated();
  if (hydrated && !ready && !waiting) {
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

  const signInWithEmail = useCallback(async () => {
    return { ok: false, error: "auth_disabled" };
  }, []);

  const saveName = useCallback(async (name: string) => {
    apiSignIn(name);
  }, []);

  return (
    <SessionContext.Provider
      value={{
        user,
        ready,
        authMode: false,
        needsProfile: false,
        signIn,
        signInWithEmail,
        saveName,
        signOut,
        updateProfile,
        requireUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within <SessionProvider>");
  return ctx;
}
