import { badRequest, notFound, withRedis } from "@/lib/server/api";
import { setRsvp } from "@/lib/server/eventsStore";
import type { RsvpStatus, User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const PUT = withRedis(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const body = (await req.json()) as {
      user?: User;
      status?: RsvpStatus;
      plusOnes?: number;
      note?: string;
    };
    if (!body.user?.id || !body.status) {
      return badRequest("user and status are required");
    }
    const evt = await setRsvp(id, body.user, body.status, {
      plusOnes: body.plusOnes,
      note: body.note,
    });
    if (!evt) return notFound("Event not found");
    return NextResponse.json(evt);
  },
);
