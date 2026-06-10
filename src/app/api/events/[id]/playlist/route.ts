import { badRequest, notFound, withRedis } from "@/lib/server/api";
import { addTrack } from "@/lib/server/eventsStore";
import type { PlaylistTrack } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = withRedis(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const track = (await req.json()) as Omit<PlaylistTrack, "id">;
    if (!track.title || !track.artist) return badRequest("Invalid track");
    const saved = await addTrack(id, track);
    if (!saved) return notFound("Event not found");
    return NextResponse.json(saved, { status: 201 });
  },
);
