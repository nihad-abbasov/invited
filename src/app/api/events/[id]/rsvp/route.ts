import { badRequest, notFound, withRedis } from "@/lib/server/api";
import { setRsvp } from "@/lib/server/eventsStore";
import { isAuthConfigured, resolveSessionUser } from "@/lib/server/sessionUser";
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
    if (!body.status) return badRequest("status is required");
    // Verified identity wins so RSVPs are tied to the real account, not a
    // per-device id. Without auth, trust the client-provided user.
    const sessionUser = await resolveSessionUser();
    if (!sessionUser && isAuthConfigured()) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const user = sessionUser ?? body.user;
    if (!user?.id) return badRequest("user is required");
    const evt = await setRsvp(id, user, body.status, {
      plusOnes: body.plusOnes,
      note: body.note,
    });
    if (!evt) return notFound("Event not found");
    return NextResponse.json(evt);
  },
);
