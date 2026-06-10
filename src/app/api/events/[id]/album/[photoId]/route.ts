import { notFound, withRedis } from "@/lib/server/api";
import { removePhoto } from "@/lib/server/eventsStore";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = withRedis(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string; photoId: string }> }) => {
    const { id, photoId } = await ctx.params;
    const ok = await removePhoto(id, photoId);
    if (!ok) return notFound("Event or photo not found");
    return new NextResponse(null, { status: 204 });
  },
);
