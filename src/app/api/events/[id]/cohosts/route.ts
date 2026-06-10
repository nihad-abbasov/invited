import { badRequest, notFound, withRedis } from "@/lib/server/api";
import { setCoHosts } from "@/lib/server/eventsStore";
import { NextRequest, NextResponse } from "next/server";

export const PUT = withRedis(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const body = (await req.json()) as { coHosts?: { id: string; name: string }[] };
    if (!Array.isArray(body.coHosts)) return badRequest("coHosts array is required");
    const evt = await setCoHosts(id, body.coHosts);
    if (!evt) return notFound("Event not found");
    return NextResponse.json(evt);
  },
);
