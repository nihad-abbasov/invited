import { badRequest, withRedis } from "@/lib/server/api";
import { createEvent, listEventsForUser } from "@/lib/server/eventsStore";
import { isAuthConfigured, resolveSessionUser } from "@/lib/server/sessionUser";
import type { CreateEventInput, User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRedis(async (req: NextRequest) => {
  const sessionUser = await resolveSessionUser();
  const userId = sessionUser?.id ?? req.nextUrl.searchParams.get("userId");
  if (!userId) {
    if (isAuthConfigured()) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return badRequest("userId is required");
  }
  const events = await listEventsForUser(userId);
  return NextResponse.json(events);
});

export const POST = withRedis(async (req: NextRequest) => {
  const body = (await req.json()) as { input?: CreateEventInput; user?: User };
  if (!body.input) return badRequest("input is required");
  // Prefer the verified session identity; fall back to the client-provided
  // user only when auth isn't configured (local/dev mode).
  const sessionUser = await resolveSessionUser();
  if (!sessionUser && isAuthConfigured()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const user = sessionUser ?? body.user;
  if (!user?.id) return badRequest("user is required");
  const evt = await createEvent(body.input, user);
  return NextResponse.json(evt, { status: 201 });
});
