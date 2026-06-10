import { badRequest, notFound, withRedis } from "@/lib/server/api";
import { addPhoto } from "@/lib/server/eventsStore";
import type { SharedAlbumPhoto } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export const POST = withRedis(
  async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
    const { id } = await ctx.params;
    const photo = (await req.json()) as Omit<SharedAlbumPhoto, "id" | "createdAt">;
    if (!photo.src || !photo.uploadedBy) return badRequest("Invalid photo");
    const saved = await addPhoto(id, photo);
    if (!saved) return notFound("Event not found");
    return NextResponse.json(saved, { status: 201 });
  },
);
