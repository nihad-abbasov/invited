"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Monitor, Moon, Plus, Sun } from "lucide-react";
import { useSession } from "@/components/session/SessionProvider";
import { Avatar } from "@/components/session/Avatar";
import { SignInDialog } from "@/components/session/SignInDialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTheme, type ThemeChoice } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/cn";

export function TopBar() {
  const pathname = usePathname();
  const { user, ready, signOut } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isPublicInvite = pathname?.startsWith("/i/");

  return (
    <>
      <header className="sticky top-0 z-40">
        <div className="glass">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span
                className="h-7 w-7 rounded-xl grid place-items-center text-white text-sm font-bold"
                style={{ background: "linear-gradient(155deg, #0a84ff, #5e5ce6)" }}
              >
                ✦
              </span>
              <span className="font-display text-[18px] font-semibold leading-none">Invited</span>
            </Link>

            {!isPublicInvite && (
              <nav className="hidden sm:flex items-center gap-1">
                <NavLink href="/" active={pathname === "/"}>Home</NavLink>
                <NavLink href="/events" active={pathname?.startsWith("/events") ?? false}>My Events</NavLink>
                <NavLink href="/create" active={pathname === "/create"}>Create</NavLink>
              </nav>
            )}

            <div className="flex items-center gap-2">
              {!isPublicInvite && (
                <Link
                  href="/create"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-sm font-medium tap-spring"
                  style={{ background: "var(--accent)" }}
                >
                  <Plus className="h-4 w-4" />
                  New event
                </Link>
              )}

              <QuickThemeButton />

              {ready && (user ? (
                <div className="relative">
                  <button
                    className="tap-spring focus-ring rounded-full"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Account"
                  >
                    <Avatar user={user} size="sm" />
                  </button>
                  {menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 glass rounded-2xl p-1 shadow-[var(--shadow-card)] z-40">
                        <div className="px-3 py-2 text-sm">
                          <div className="font-medium truncate">{user.name}</div>
                          <div className="text-xs text-[var(--foreground-secondary)]">No iCloud required</div>
                        </div>
                        <div className="my-1 h-px bg-[var(--hairline)]" />
                        <div className="px-3 py-2">
                          <div className="text-[10px] uppercase tracking-wider text-[var(--foreground-secondary)] font-medium mb-1.5">
                            Appearance
                          </div>
                          <ThemeToggle className="!flex w-full [&_button]:flex-1 [&_button]:justify-center" />
                        </div>
                        <div className="my-1 h-px bg-[var(--hairline)]" />
                        <MenuItem onClick={() => { setSignInOpen(true); setMenuOpen(false); }}>
                          Change name
                        </MenuItem>
                        <Link href="/events" className="block">
                          <MenuItem onClick={() => setMenuOpen(false)}>My events</MenuItem>
                        </Link>
                        <MenuItem onClick={() => { signOut(); setMenuOpen(false); }} danger>
                          Sign out
                        </MenuItem>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setSignInOpen(true)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium hairline tap-spring"
                >
                  Sign in
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm transition-colors",
        active
          ? "bg-[var(--surface)] text-[var(--foreground)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)]",
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Single-icon quick toggle. Cycles Light → Dark → System and reflects the
 * current state. Visible to everyone (signed-in or not) for one-tap access.
 */
function QuickThemeButton() {
  const { choice, setChoice, resolved } = useTheme();
  const next: Record<ThemeChoice, ThemeChoice> = {
    light: "dark",
    dark: "system",
    system: "light",
  };
  // What icon to show: explicit Sun/Moon when forced, Monitor for "system".
  const Icon = choice === "system" ? Monitor : resolved === "dark" ? Moon : Sun;
  const label =
    choice === "system" ? "System theme — click for Light" :
    choice === "light"  ? "Light theme — click for Dark"  :
                          "Dark theme — click for System";
  return (
    <button
      type="button"
      onClick={() => setChoice(next[choice])}
      className="h-8 w-8 rounded-full grid place-items-center hairline tap-spring text-[var(--foreground)] hover:bg-[var(--hairline)] transition-colors"
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-[var(--hairline)] transition-colors",
        danger && "text-[var(--red)]",
      )}
    >
      {children}
    </button>
  );
}
