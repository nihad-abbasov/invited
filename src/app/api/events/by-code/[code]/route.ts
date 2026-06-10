import { notFound, withRedis } from "@/lib/server/api";
import { getEventByCode } from "@/lib/server/eventsStore";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRedis(
  async (_req: NextRequest, ctx: { params: Promise<{ code: string }> }) => {
    const { code } = await ctx.params;
    const evt = await getEventByCode(code);
    if (!evt) return notFound("Event not found");
    return NextResponse.json(evt);
  },
);
