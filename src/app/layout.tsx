import type { Metadata, Viewport } from "next";
import {
  Plus_Jakarta_Sans,
  Fraunces,
  Quicksand,
  Caveat,
  Geist_Mono,
} from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session/SessionProvider";
import {
  ThemeProvider,
  THEME_INIT_SCRIPT,
} from "@/components/theme/ThemeProvider";
import { TopBar } from "@/components/shell/TopBar";

/**
 * Body / UI: friendly modern sans-serif. Keeps the Apple-flavored neatness
 * but with a touch more warmth than Inter — fits an event app better.
 */
const jakarta = Plus_Jakarta_Sans({
  variable: "--ff-sans",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Display: variable serif with character. We enable optical-size and the SOFT
 * axis so the "feel like an event" gradient headline and invitation titles
 * get a warmer, less stern presence.
 */
const fraunces = Fraunces({
  variable: "--ff-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

/** Friendly rounded geometric for the "Rounded" preset. */
const quicksand = Quicksand({
  variable: "--ff-rounded",
  subsets: ["latin"],
  display: "swap",
});

/** Handwritten "Script" preset — great for save-the-dates. */
const caveat = Caveat({
  variable: "--ff-script",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--ff-mono",
  subsets: ["latin"],
  display: "swap",
});

const fontVars = [jakarta, fraunces, quicksand, caveat, geistMono]
  .map((f) => f.variable)
  .join(" ");

export const metadata: Metadata = {
  title: "Invited — Bring people together",
  description:
    "Create beautiful invitations, manage RSVPs, share a playlist and a photo album. No app required.",
  applicationName: "Invited",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontVars} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets data-theme before paint so there's no flash if the user
            previously picked light/dark explicitly. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <SessionProvider>
            <TopBar />
            <main className="flex-1 flex flex-col">{children}</main>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
