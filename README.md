# Invited

Make the moment feel like an event.

An Apple-inspired invitation app built with Next.js. Create beautiful
invitations, manage RSVPs, share a collaborative playlist and a shared
photo album — all from any device, no app download required.

This project re-imagines the experience of Apple's _Invites_ app for the
web, with no iCloud requirement so it works equally well on phones,
tablets, and laptops.

## Highlights

- **Apple-style design system** — system blues and pinks, SF-feeling
  typography stack, rounded corners with continuous curvature, glass
  surfaces with backdrop blur, springy easings everywhere.
- **Multi-step event creation** with a live preview that updates as you
  type. Pick a curated emoji background, a color gradient, or upload a
  photo from your device.
- **RSVP without an account** — guests visit the share link, pick a
  name, and reply.
- **Auto-included extras** — stylized map preview and a weather forecast
  for the date and location.
- **Shared playlist** and **shared album** scaffolds, ready to be wired
  to Apple Music / cloud storage.
- **Light and dark mode** out of the box (follows `prefers-color-scheme`).

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- React 19, TypeScript 5
- Tailwind CSS 4
- [Framer Motion](https://www.framer.com/motion/) for animation
- [Lucide](https://lucide.dev) icons

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

A pair of sample events is automatically seeded on first run so the
dashboard isn't empty.

## Project layout

```
src/
├─ app/
│  ├─ page.tsx              # Marketing landing page
│  ├─ create/page.tsx       # Multi-step event creation flow
│  ├─ events/page.tsx       # "My events" dashboard
│  ├─ events/[id]/page.tsx  # Host-facing event detail
│  └─ i/[code]/page.tsx     # Public invitation page (shareable link)
├─ components/
│  ├─ create/               # Background / font / accent pickers
│  ├─ event/                # EventView and its tabs (Guests, Messages,
│  │                        # Music, Album, Map, Weather, RSVP, Share)
│  ├─ events/               # Dashboard tiles
│  ├─ invitation/           # The invitation card itself
│  ├─ session/              # Lightweight identity (no real auth)
│  ├─ shell/                # TopBar
│  └─ ui/                   # Small primitives (Field, Segmented)
└─ lib/
   ├─ api/                  # MOCK-BACKED data layer (events, photos,
   │                        # weather, session). See "Backend" below.
   ├─ mock/                 # localStorage helpers & seed data
   ├─ types.ts              # Domain types (User, Event, Guest, …)
   ├─ design.ts             # Backgrounds, fonts, accents catalogs
   └─ format.ts             # Locale-stable date helpers
```

## Backend: this app is mocked

To keep things runnable without standing up a server, all "API"
functions in `src/lib/api/*` are backed by the browser's
`localStorage`. Every function corresponds 1-to-1 to an endpoint you'd
build on a real backend and has a `REPLACE-WITH-REAL-BACKEND` comment
with suggestions.

Suggested mapping when you're ready to make it real:

| File                | Function          | Real endpoint                 |
| ------------------- | ----------------- | ----------------------------- |
| `api/events.ts`     | `listEvents`      | `GET /api/events`             |
| `api/events.ts`     | `getEvent`        | `GET /api/events/:id`         |
| `api/events.ts`     | `getEventByCode`  | `GET /api/events/by-code/:c`  |
| `api/events.ts`     | `createEvent`     | `POST /api/events`            |
| `api/events.ts`     | `updateEvent`     | `PATCH /api/events/:id`       |
| `api/events.ts`     | `deleteEvent`     | `DELETE /api/events/:id`      |
| `api/events.ts`     | `setRsvp`         | `PUT /api/events/:id/rsvp`    |
| `api/events.ts`     | `postMessage`     | `POST /api/events/:id/messages` |
| `api/events.ts`     | `addTrack` / `removeTrack` | `POST/DELETE /api/events/:id/playlist` |
| `api/events.ts`     | `addPhoto` / `removePhoto` | `POST/DELETE /api/events/:id/album`    |
| `api/photos.ts`     | `fileToDataUrl`   | Pre-signed S3 upload          |
| `api/weather.ts`    | `forecastFor`     | WeatherKit / OpenWeather      |
| `api/session.ts`    | `signIn` / `currentUser` | Cookie-session / NextAuth |

### Photo uploads

`fileToDataUrl` reads the file and downscales it client-side, then
keeps the result as a `data:` URL inside the event. In production:

1. Request a pre-signed upload URL from your backend.
2. `PUT` the original `File` blob to S3/GCS/etc.
3. Store the resulting URL on the event instead of a `data:` URL.

### Maps & weather

`MapPreview` renders a stylized SVG "map" and links out to Google
Maps. Swap for [MapKit JS](https://developer.apple.com/maps/web/),
Mapbox, or Google Maps Embed when you're ready. The `EventLocation`
type already carries `lat`/`lng`.

The weather forecast is deterministic per `(date, location)` so it
feels real during development. Replace `forecastFor` with a real
weather API call (`WeatherKit`, OpenWeather, Tomorrow.io).

### Music / playlists

The shared playlist is a local stub. Apple's Invites app uses
[MusicKit JS](https://developer.apple.com/musickit/js/) for
collaborative Apple Music playlists, which requires an Apple Music
subscription. When wiring it up:

- Use MusicKit search to add real tracks (artwork + ISRC / track id).
- Persist a real Apple Music playlist id on the event.
- Restrict editing to guests with `status === "going"`.

## Identity

There's no real auth. Anyone — any device, any browser — can:

1. Click _Sign in_ in the top bar and type a display name.
2. Create events or RSVP to any link they have.

The "session" is just a `User` blob in `localStorage`. When you're
ready for real auth, replace `src/lib/api/session.ts` with calls to
your auth provider and keep the `User` shape stable.

## Scripts

```bash
npm run dev        # next dev (Turbopack)
npm run build      # production build
npm run start      # serve the production build
npm run lint       # eslint
npm run test       # run the vitest suite once
npm run test:watch # vitest in watch mode
```

## Roadmap / nice-to-haves

Recently shipped:

- ✅ Edit an existing event + delete, with **co-hosts** (promote a guest to
  co-host so they can edit and share). See `src/app/events/[id]/edit`.
- ✅ **Plus-ones & RSVP notes** in the reply UI (`RsvpBar`).
- ✅ **Toast notifications** (`src/components/ui/Toast.tsx`) wired into copy
  link / RSVP / save actions.
- ✅ **OpenGraph / Twitter cards** with branded, bundled-font `next/og`
  images for the home page and shared invites (`opengraph-image.tsx`).
  > Note: per-event preview text needs a server-readable backend — in mock
  > mode events live in `localStorage`, so the card is intentionally generic.
  > The wiring (`generateMetadata`, segment `opengraph-image`) is ready to
  > read the event once a real backend lands.
- ✅ A **vitest** unit suite covering the `lib/` logic.

Still open:

- Native share sheet integration on iOS (we already call
  `navigator.share` where available).
- Real-time updates when guests RSVP (server-sent events / websockets).
- Calendar export (`.ics`) for guests who RSVP _going_.
- Swap the mock `localStorage` backend in `src/lib/api/*` for a real server.
