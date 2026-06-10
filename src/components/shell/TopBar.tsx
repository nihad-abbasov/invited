"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useTheme, type ThemeChoice } from "@/components/theme/ThemeProvider";
import { useSession } from "@/components/session/SessionProvider";
import { SignInDialog } from "@/components/session/SignInDialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Monitor, Moon, Plus, Sun } from "lucide-react";
import { Avatar } from "@/components/session/Avatar";
import { Button } from "@/components/ui/Button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useState } from "react";
import Link from "next/link";

export function TopBar() {
  const pathname = usePathname();
  const { user, ready, signOut, authMode, needsProfile } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);

  // After a magic-link sign-in, ask the user to set a display name once so the
  // host sees a real name instead of their email handle.
  const [promptedProfile, setPromptedProfile] = useState(false);
  if (ready && authMode && needsProfile && !promptedProfile && !signInOpen) {
    setPromptedProfile(true);
    setSignInOpen(true);
  }

  const isPublicInvite = pathname?.startsWith("/i/");

  return (
    <>
      <header className="sticky top-0 z-40">
        <div className="glass">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span
                className="h-7 w-7 rounded-xl grid place-items-center text-white text-sm font-bold"
                style={{
                  background: "linear-gradient(155deg, #0a84ff, #5e5ce6)",
                }}
              >
                ✦
              </span>
              <span className="font-display text-[18px] font-semibold leading-none">
                Invited
              </span>
            </Link>

            {!isPublicInvite && (
              <nav className="hidden sm:flex items-center gap-1">
                <NavLink href="/" active={pathname === "/"}>
                  Home
                </NavLink>
                <NavLink
                  href="/events"
                  active={pathname?.startsWith("/events") ?? false}
                >
                  My Events
                </NavLink>
                <NavLink href="/create" active={pathname === "/create"}>
                  Create
                </NavLink>
              </nav>
            )}

            <div className="flex items-center gap-2">
              {!isPublicInvite && (
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/create">
                    <Plus className="h-4 w-4" />
                    New event
                  </Link>
                </Button>
              )}

              <QuickThemeButton />

              {ready &&
                (user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="tap-spring focus-ring rounded-full"
                        aria-label="Account"
                      >
                        <Avatar user={user} size="sm" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel>
                        <div className="font-medium truncate">{user.name}</div>
                        <div className="text-xs text-muted font-normal">
                          No iCloud required
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="px-3 py-2">
                        <div className="text-[10px] uppercase tracking-wider text-muted font-medium mb-1.5">
                          Appearance
                        </div>
                        <ThemeToggle className="!flex w-full [&_button]:flex-1 [&_button]:justify-center" />
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSignInOpen(true)}>
                        Change name
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/events">My events</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={signOut}
                        className="text-[var(--red)] focus:text-[var(--red)]"
                      >
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSignInOpen(true)}
                  >
                    Sign in
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </header>

      <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm transition-colors",
        active
          ? "bg-surface text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          : "text-muted hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}

function QuickThemeButton() {
  const { choice, setChoice, resolved } = useTheme();
  const next: Record<ThemeChoice, ThemeChoice> = {
    light: "dark",
    dark: "system",
    system: "light",
  };
  const Icon = choice === "system" ? Monitor : resolved === "dark" ? Moon : Sun;
  const label =
    choice === "system"
      ? "System theme — click for Light"
      : choice === "light"
        ? "Light theme — click for Dark"
        : "Dark theme — click for System";
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={() => setChoice(next[choice])}
      title={label}
      aria-label={label}
      className="h-8 w-8"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
