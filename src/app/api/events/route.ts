import { badRequest, withRedis } from "@/lib/server/api";
import { createEvent, listEventsForUser } from "@/lib/server/eventsStore";
import type { CreateEventInput, User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRedis(async (req: NextRequest) => {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return badRequest("userId is required");
  const events = await listEventsForUser(userId);
  return NextResponse.json(events);
});

export const POST = withRedis(async (req: NextRequest) => {
  const body = (await req.json()) as { input?: CreateEventInput; user?: User };
  if (!body.input || !body.user?.id) return badRequest("input and user are required");
  const evt = await createEvent(body.input, body.user);
  return NextResponse.json(evt, { status: 201 });
});
