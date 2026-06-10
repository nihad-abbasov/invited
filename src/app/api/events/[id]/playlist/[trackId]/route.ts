import { notFound, withRedis } from "@/lib/server/api";
import { removeTrack } from "@/lib/server/eventsStore";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = withRedis(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string; trackId: string }> }) => {
    const { id, trackId } = await ctx.params;
    const ok = await removeTrack(id, trackId);
    if (!ok) return notFound("Event or track not found");
    return new NextResponse(null, { status: 204 });
  },
);
