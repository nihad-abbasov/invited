import { notFound, withRedis } from "@/lib/server/api";
import { deleteEvent, getEvent, updateEvent } from "@/lib/server/eventsStore";
import type { CreateEventInput } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const GET = withRedis(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const evt = await getEvent(id);
    if (!evt) return notFound("Event not found");
    return NextResponse.json(evt);
  },
);

export const PATCH = withRedis(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const patch = (await req.json()) as Partial<CreateEventInput>;
    const evt = await updateEvent(id, patch);
    if (!evt) return notFound("Event not found");
    return NextResponse.json(evt);
  },
);

export const DELETE = withRedis(
  async (_req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const ok = await deleteEvent(id);
    if (!ok) return notFound("Event not found");
    return new NextResponse(null, { status: 204 });
  },
);
