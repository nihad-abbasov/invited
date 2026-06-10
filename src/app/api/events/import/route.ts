import { badRequest, withRedis } from "@/lib/server/api";
import { importEvent } from "@/lib/server/eventsStore";
import type { InvitedEvent } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = withRedis(async (req: NextRequest) => {
  const evt = (await req.json()) as InvitedEvent;
  if (!evt?.id || !evt.shortCode || !evt.title) {
    return badRequest("Invalid event payload");
  }
  const saved = await importEvent(evt);
  return NextResponse.json(saved);
});
