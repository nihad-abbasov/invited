import { badRequest, notFound, withRedis } from "@/lib/server/api";
import { postMessage } from "@/lib/server/eventsStore";
import type { User } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = withRedis(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const body = (await req.json()) as { body?: string; author?: User };
    if (!body.body?.trim() || !body.author?.id) {
      return badRequest("body and author are required");
    }
    const msg = await postMessage(id, body.body, body.author);
    if (!msg) return notFound("Event not found");
    return NextResponse.json(msg, { status: 201 });
  },
);
